'use client';
import { useState, type JSXElementConstructor, type Key, type ReactElement, type ReactNode, type ReactPortal } from 'react';
import { X, Camera, MapPin, Clock } from 'lucide-react';

// Mock color classes since we don't have the actual import
import colorClasses from '@/styles/colors'; // Ensure this path is correct

const categories = {
  'Accessories': ['Jewelry', 'Watches', 'Bags', 'Wallets', 'Sunglasses', 'Keys', 'Other'],
  'Electronics': ['Phones', 'Laptops', 'Tablets', 'Headphones', 'Chargers', 'Cameras', 'Other'],
  'Documents': ['ID Cards', 'Passports', 'Licenses', 'Credit Cards', 'Certificates', 'Other']
};

// Common locations in Sri Lanka
const commonLocations = [
  'Colombo',
  'Kandy',
  'Gampaha',
  'Kalutara',
  'Matara',
  'Galle',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Moneragala',
  'Ratnapura',
  'Kegalle',
  'Nuwara Eliya'
];

export default function ReportItemPage() {
  const [postType, setPostType] = useState('lost');
  const [postData, setPostData] = useState({
    title: '',
    category: '',
    subcategory: '',
    location: '',
    date: '',
    time: '',
    color: '',
    description: '',
    reward: '',
    photos: []
  });

  const handleCategoryChange = (e: { target: { value: any; }; }) => {
    const newCategory = e.target.value;
    setPostData({ 
      ...postData, 
      category: newCategory, 
      subcategory: '' // Reset subcategory when category changes
    });
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const newItem = {
      id: Math.random(),
      type: postType,
      ...postData,
      user: 'John Doe', // Replace with real user
      matchScore: 0,
      status: 'active',
      image: '/api/placeholder/200/200'
    };
    console.log('Submitted Item:', newItem);
    // Redirect or show confirmation
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // Format as HH:MM
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${colorClasses.textPrimary}`}>
          Report {postType === 'lost' ? 'Lost' : 'Found'} Item
        </h2>
      </div>

      <div className="flex mb-6">
        <button
          onClick={() => setPostType('lost')}
          className={`px-4 py-2 rounded-l-lg font-medium ${postType === 'lost' ? colorClasses.primary : 'bg-gray-200 text-gray-700'}`}
        >
          Lost Item
        </button>
        <button
          onClick={() => setPostType('found')}
          className={`px-4 py-2 rounded-r-lg font-medium ${postType === 'found' ? colorClasses.found : 'bg-gray-200 text-gray-700'}`}
        >
          Found Item
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="Item Name"
            value={postData.title}
            onChange={(e: { target: { value: any; }; }) => setPostData({ ...postData, title: e.target.value })}
            required icon={undefined}          />
          
          <SelectField 
            label="Category"
            value={postData.category}
            onChange={handleCategoryChange}
            options={Object.keys(categories)}
            required icon={undefined}          />

          {postData.category && (
            <SelectField 
              label="Subcategory"
              value={postData.subcategory}
              onChange={(e: { target: { value: any; }; }) => setPostData({ ...postData, subcategory: e.target.value })}
              options={categories[postData.category]}
              required icon={undefined}            />
          )}
          
          <SelectField 
            label="Location" 
            value={postData.location} 
            onChange={(e: { target: { value: any; }; }) => setPostData({ ...postData, location: e.target.value })} 
            options={commonLocations} 
            required 
            icon={<MapPin size={16} />}
          />
          
          <InputField 
            label="Date"
            type="date"
            value={postData.date}
            onChange={(e: { target: { value: any; }; }) => setPostData({ ...postData, date: e.target.value })}
            required icon={undefined}          />
          
          {/* <div className="relative">
            <InputField 
              label="Time"
              type="time"
              value={postData.time}
              onChange={(e: { target: { value: any; }; }) => setPostData({ ...postData, time: e.target.value })}
              required icon={undefined}            />
            <button
              type="button"
              onClick={() => setPostData({ ...postData, time: getCurrentTime() })}
              className="absolute right-2 top-8 text-blue-600 hover:text-blue-800 text-sm"
            >
              Now
            </button>
          </div> */}
          
          <InputField 
            label="Color"
            value={postData.color}
            onChange={(e: { target: { value: any; }; }) => setPostData({ ...postData, color: e.target.value })}
            placeholder="e.g., Red, Blue, Black" icon={undefined}          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${colorClasses.textPrimary} mb-2`}>Description</label>
          <textarea
            className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            rows={4}
            value={postData.description}
            onChange={(e) => setPostData({ ...postData, description: e.target.value })}
            placeholder="Provide detailed description of the item..."
            required
          />
        </div>

        {postType === 'lost' && (
          <InputField
            label="Reward (Optional)"
            type="number"
            value={postData.reward}
            onChange={(e: { target: { value: any; }; }) =>
              setPostData({ ...postData, reward: e.target.value })
            }
            placeholder="Enter reward amount in LKR"
            icon={undefined}
          />
        )}

        <div>
          <label className={`block text-sm font-medium ${colorClasses.textPrimary} mb-2`}>Photos</label>
          <div className={`border-2 border-dashed ${colorClasses.border} rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer`}>
            <Camera className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-600 mb-1">Click to upload photos</p>
            <p className="text-sm text-gray-500">Upload up to 5 photos to help identify your item</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className={`w-full py-3 px-4 ${postType === 'lost' ? colorClasses.primary : colorClasses.found} ${colorClasses.primaryHover} rounded-md font-medium transition-colors`}
        >
          Post {postType === 'lost' ? 'Lost' : 'Found'} Item
        </button>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', required = false, placeholder = '', icon }) {
  return (
    <div>
      <label className={`block text-sm font-medium ${colorClasses.textPrimary} mb-2`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : ''} px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          value={value}
          onChange={onChange}
          required={required}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options, required = false, icon }) {
  return (
    <div>
      <label className={`block text-sm font-medium ${colorClasses.textPrimary} mb-2`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        <select
          className={`w-full ${icon ? 'pl-10' : ''} px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white`}
          value={value}
          onChange={onChange}
          required={required}
        >
          <option value="">Select {label}</option>
          {options.map((opt: boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | Key | null | undefined) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}