const PostItemModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-center text-[#7B3F00]">Post New Item</h2>
          <p className="text-sm text-gray-600 text-center">Form to post lost or found item will go here.</p>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            //   onClick={() => setShowPostModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  export default PostItemModal;