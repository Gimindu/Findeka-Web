'use client';

import { useState } from 'react';
import { X, Camera } from 'lucide-react';
import colorClasses from '@/styles/colors'; // Adjust import as needed

const categories = ['Accessories', 'Electronics', 'Documents']; // Mock

export default function ReportItemPage() {
  const [postType, setPostType] = useState('lost');
  const [postData, setPostData] = useState({
    title: '',
    category: '',
    location: '',
    date: '',
    time: '',
    color: '',
    size: '',
    description: '',
    reward: '',
    photos: []
  });

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Item Name" value={postData.title} onChange={(e: { target: { value: any; }; }) => setPostData({ ...postData, title: e.target.value })} required />
          <SelectField label="Category" value={postData.category} onChange={(e: { target: { value: any; }; }) => setPostData({ ...postData, category: e.target.value })} options={categories} required />
          <InputField label="Location" value={postData.location} onChange={(e: { target: { value: any; }; }) => setPostData({ ...postData, location: e.target.value })} required />
          <InputField label="Date" type="date" value={postData.date} onChange={(e: { target: { value: any; }; }) => setPostData({ ...postData, date: e.target.value })} required />
          <InputField label="Color" value={postData.color} onChange={(e: { target: { value: any; }; }) => setPostData({ ...postData, color: e.target.value })} />
          <InputField label="Size" value={postData.size} onChange={(e: { target: { value: any; }; }) => setPostData({ ...postData, size: e.target.value })} />
        </div>

        <div>
          <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Description</label>
          <textarea
            className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
            rows={4}
            value={postData.description}
            onChange={(e) => setPostData({ ...postData, description: e.target.value })}
            required
          />
        </div>

        <InputField
          label="Reward (Optional)"
          type="number"
          value={postData.reward}
          onChange={(e: { target: { value: any; }; }) => setPostData({ ...postData, reward: e.target.value })}
          placeholder="Enter reward amount"
        />

        <div>
          <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>Photos</label>
          <div className={`border-2 border-dashed ${colorClasses.border} rounded-lg p-4 text-center`}>
            <Camera className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-600">Click to upload photos</p>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full py-3 px-4 ${postType === 'lost' ? colorClasses.primary : colorClasses.found} ${colorClasses.primaryHover} rounded-md font-medium transition-colors`}
        >
          Post {postType === 'lost' ? 'Lost' : 'Found'} Item
        </button>
      </form>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
};

function InputField({ label, value, onChange, type = 'text', required = false, placeholder = '' }: InputFieldProps) {
  return (
    <div>
      <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  required?: boolean;
};

function SelectField({ label, value, onChange, options, required = false }: SelectFieldProps) {
  return (
    <div>
      <label className={`block text-sm font-medium ${colorClasses.textPrimary}`}>{label}</label>
      <select
        className={`w-full px-3 py-2 border ${colorClasses.border} rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
        value={value}
        onChange={onChange}
        required={required}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
