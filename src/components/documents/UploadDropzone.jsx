import React, { useRef } from "react";
import { UploadCloud } from "lucide-react";

export default function UploadDropzone({ onFileSelect }) {
	const fileInputRef = useRef(null);

	const handleChange = (e) => {
		if (e.target.files && onFileSelect) {
			onFileSelect(e);
		}
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
			<div className="p-6">
				<div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative cursor-pointer group">
					<input
						type="file"
						multiple
						ref={fileInputRef}
						onChange={handleChange}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div className="flex flex-col items-center pointer-events-none group-hover:scale-105 transition-transform">
						<div className="bg-blue-50 p-4 rounded-full mb-4">
							<UploadCloud size={32} className="text-blue-600" />
						</div>
						<p className="text-lg font-medium text-gray-900">
							Click to upload or drag and drop
						</p>
						<p className="text-sm text-gray-500 mt-1">
							PDF, DOCX, TXT supported
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
