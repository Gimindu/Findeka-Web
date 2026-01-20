import { useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";

interface DatabaseImage {
  id: number;
  url: string;
  name: string;
  features: number[];
  addedAt: string;
}

interface QueryImage {
  url: string;
  name: string;
  features: number[];
}

interface Match {
  image: DatabaseImage;
  similarity: number;
}

const ImageMatchingDemo = () => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [database, setDatabase] = useState<DatabaseImage[]>([]);
  const [queryImage, setQueryImage] = useState<QueryImage | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [status, setStatus] = useState("Ready to load model");

  const databaseInputRef = useRef<HTMLInputElement>(null);
  const queryInputRef = useRef<HTMLInputElement>(null);

  // Load MobileNet model
  const loadModel = async () => {
    try {
      setLoading(true);
      setStatus("Loading MobileNet model...");

      const mobilenet = await tf.loadLayersModel(
        "https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/classification/3/default/1",
        { fromTFHub: true }
      );

      // Remove the last classification layer to get feature embeddings
      const layer = mobilenet.getLayer("global_average_pooling2d");
      const featureModel = tf.model({
        inputs: mobilenet.input,
        outputs: layer.output,
      });

      setModel(featureModel);
      setStatus(
        "Model loaded! Add images to database, then search with query images."
      );
      setLoading(false);
    } catch (error) {
      console.error("Error loading model:", error);
      setStatus("Error loading model. Check console for details.");
      setLoading(false);
    }
  };

  // Preprocess image for MobileNet
  const preprocessImage = (imageElement: HTMLImageElement) => {
    return tf.tidy(() => {
      let tensor = tf.browser.fromPixels(imageElement);
      tensor = tf.image.resizeBilinear(tensor, [224, 224]);
      tensor = tensor.div(127.5).sub(1);
      return tensor.expandDims(0);
    });
  };

  // Extract features from image
  const extractFeatures = async (
    imageElement: HTMLImageElement
  ): Promise<number[] | null> => {
    if (!model) return null;

    const preprocessed = preprocessImage(imageElement);
    const prediction = model.predict(preprocessed);
    const tensor = Array.isArray(prediction) ? prediction[0] : prediction;
    const features = await tensor.data();
    preprocessed.dispose();

    return Array.from(features);
  };

  // Calculate cosine similarity
  const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    const dotProduct = vecA.reduce(
      (sum: number, a: number, i: number) => sum + a * vecB[i],
      0
    );
    const magnitudeA = Math.sqrt(
      vecA.reduce((sum: number, a: number) => sum + a * a, 0)
    );
    const magnitudeB = Math.sqrt(
      vecB.reduce((sum: number, b: number) => sum + b * b, 0)
    );
    return dotProduct / (magnitudeA * magnitudeB);
  };

  // Add images to database
  const handleDatabaseUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !model) return;

    setStatus(`Adding ${files.length} images to database...`);
    const newDatabaseImages: DatabaseImage[] = [];

    for (let file of files) {
      const imageUrl = URL.createObjectURL(file as Blob);
      const img = new Image();

      await new Promise<void>((resolve) => {
        img.onload = async () => {
          const features = await extractFeatures(img);
          if (features) {
            newDatabaseImages.push({
              id: Date.now() + Math.random(),
              url: imageUrl,
              name: (file as File).name,
              features: features,
              addedAt: new Date().toLocaleTimeString(),
            });
          }
          resolve();
        };
        img.src = imageUrl;
      });
    }

    setDatabase((prev) => [...prev, ...newDatabaseImages]);
    setStatus(
      `Database updated! ${
        database.length + newDatabaseImages.length
      } images available for matching.`
    );
  };

  // Search with query image
  const handleQueryUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !model || database.length === 0) {
      setStatus(
        "Please add images to database first, then upload a query image."
      );
      return;
    }

    setStatus("Processing query image...");
    const imageUrl = URL.createObjectURL(file as Blob);
    const img = new Image();

    img.onload = async () => {
      const queryFeatures = await extractFeatures(img);
      if (!queryFeatures) return;

      const queryImg: QueryImage = {
        url: imageUrl,
        name: (file as File).name,
        features: queryFeatures,
      };

      setQueryImage(queryImg);

      // Find matches in database
      const similarities = database.map((dbImage) => ({
        image: dbImage,
        similarity: cosineSimilarity(queryFeatures, dbImage.features),
      }));

      // Sort by similarity (highest first)
      similarities.sort((a, b) => b.similarity - a.similarity);
      setMatches(similarities);

      setStatus(
        `Found ${similarities.length} potential matches! Results sorted by similarity.`
      );
    };

    img.src = imageUrl;
  };

  // Clear database
  const clearDatabase = () => {
    database.forEach((img) => URL.revokeObjectURL(img.url));
    setDatabase([]);
    setMatches([]);
    if (queryImage) {
      URL.revokeObjectURL(queryImage.url);
      setQueryImage(null);
    }
    setStatus("Database cleared.");
  };

  // Clear query
  const clearQuery = () => {
    if (queryImage) {
      URL.revokeObjectURL(queryImage.url);
      setQueryImage(null);
    }
    setMatches([]);
    setStatus("Query cleared.");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Image Database Search
        </h1>
        <p className="text-gray-600 mb-4">
          Build a database of images, then upload a query image to find similar
          matches. This simulates a real-world image matching system.
        </p>

        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={loadModel}
            disabled={loading || !!model}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading
              ? "Loading Model..."
              : model
              ? "Model Ready"
              : "Load Model"}
          </button>

          <input
            ref={databaseInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleDatabaseUpload}
            disabled={!model}
            className="hidden"
          />

          <button
            onClick={() => databaseInputRef.current?.click()}
            disabled={!model}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add to Database ({database.length})
          </button>

          <input
            ref={queryInputRef}
            type="file"
            accept="image/*"
            onChange={handleQueryUpload}
            disabled={!model || database.length === 0}
            className="hidden"
          />

          <button
            onClick={() => queryInputRef.current?.click()}
            disabled={!model || database.length === 0}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Search Image
          </button>

          <button
            onClick={clearDatabase}
            disabled={database.length === 0}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Clear Database
          </button>
        </div>

        <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg">
          Status: {status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Database Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📚 Image Database
            <span className="text-sm font-normal text-gray-500">
              ({database.length} images)
            </span>
          </h2>

          {database.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
              No images in database yet.
              <br />
              <span className="text-sm">
                Upload multiple images to build your searchable database.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
              {database.map((img) => (
                <div key={img.id} className="text-center">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-20 object-cover rounded shadow-sm mb-1"
                  />
                  <p className="text-xs text-gray-600 truncate">{img.name}</p>
                  <p className="text-xs text-gray-400">{img.addedAt}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Query Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔍 Query Image
            {queryImage && (
              <button
                onClick={clearQuery}
                className="text-sm text-red-600 hover:text-red-800"
              >
                (clear)
              </button>
            )}
          </h2>

          {!queryImage ? (
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center text-gray-500">
              No query image selected.
              <br />
              <span className="text-sm">
                Upload an image to search for similar matches in the database.
              </span>
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <img
                src={queryImage.url}
                alt={queryImage.name}
                className="w-full h-48 object-contain rounded mb-2"
              />
              <p className="text-sm font-medium text-center">
                {queryImage.name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {matches.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            🎯 Search Results ({matches.length} matches found)
          </h2>

          <div className="space-y-3">
            {matches.map((match, index) => {
              const similarity = match.similarity;
              const isHighMatch = similarity > 0.8;
              const isMediumMatch = similarity > 0.6;

              return (
                <div
                  key={match.image.id}
                  className={`border rounded-lg p-4 ${
                    isHighMatch
                      ? "bg-green-50 border-green-200"
                      : isMediumMatch
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-bold text-gray-400 w-8">
                      #{index + 1}
                    </div>

                    <img
                      src={match.image.url}
                      alt={match.image.name}
                      className="w-16 h-16 object-cover rounded"
                    />

                    <div className="flex-1">
                      <p className="font-medium">{match.image.name}</p>
                      <p className="text-sm text-gray-600">
                        Added: {match.image.addedAt}
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${
                          isHighMatch
                            ? "text-green-600"
                            : isMediumMatch
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        {(similarity * 100).toFixed(1)}%
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            isHighMatch
                              ? "bg-green-600"
                              : isMediumMatch
                              ? "bg-yellow-600"
                              : "bg-gray-400"
                          }`}
                          style={{ width: `${similarity * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {isHighMatch
                          ? "High Match"
                          : isMediumMatch
                          ? "Medium"
                          : "Low Match"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">How to use:</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Load the MobileNet model (one-time setup)</li>
          <li>Add multiple images to your database using "Add to Database"</li>
          <li>
            Upload a query image using "Search Image" to find similar matches
          </li>
          <li>
            Results are ranked by similarity percentage (80%+ = high match)
          </li>
        </ol>

        <h3 className="font-semibold mt-4 mb-2">Perfect for testing:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Product catalogs (find similar products)</li>
          <li>• Duplicate detection (upload same/similar images)</li>
          <li>• Visual search (find items by appearance)</li>
          <li>• Content moderation (match against known images)</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageMatchingDemo;
