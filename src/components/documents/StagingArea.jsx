import React from "react";
import { FileText, Zap, Search, X, Loader2, UploadCloud } from "lucide-react";

export default function StagingArea({
	stagedFiles,
	onUpdateStrategy,
	onRemoveFile,
	onUploadAll,
	isUploading,
}) {
	if (stagedFiles.length === 0) return null;

	return (
		<div className="bg-gray-50 border-t border-gray-100 p-6 animate-in slide-in-from-top-2 rounded-xl mt-4">
			<h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
				Ready to Upload ({stagedFiles.length})
			</h3>

			<div className="space-y-3 mb-6">
				{stagedFiles.map((item) => (
					<div
						key={item.id}
						className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
					>
						<div className="flex items-center gap-3 overflow-hidden">
							<div className="bg-gray-100 p-2 rounded">
								<FileText size={20} className="text-gray-600" />
							</div>
							<span
								className="text-sm font-medium text-gray-700 truncate max-w-[200px]"
								title={item.file.name}
							>
								{item.file.name}
							</span>
							<span className="text-xs text-gray-400">
								{(item.file.size / 1024 / 1024).toFixed(2)} MB
							</span>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex bg-gray-100 rounded-lg p-1">
								<button
									onClick={() =>
										onUpdateStrategy(item.id, "fast")
									}
									className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
										item.strategy === "fast"
											? "bg-white text-blue-700 shadow-sm"
											: "text-gray-500 hover:text-gray-700"
									}`}
								>
									<Zap
										size={12}
										fill={
											item.strategy === "fast"
												? "currentColor"
												: "none"
										}
									/>{" "}
									Deterministic
								</button>
								<button
									onClick={() =>
										onUpdateStrategy(item.id, "accurate")
									}
									className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
										item.strategy === "accurate"
											? "bg-white text-purple-700 shadow-sm"
											: "text-gray-500 hover:text-gray-700"
									}`}
								>
									<Search size={12} /> IBM Docling
								</button>
							</div>
							<button
								onClick={() => onRemoveFile(item.id)}
								className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
							>
								<X size={18} />
							</button>
						</div>
					</div>
				))}
			</div>

			<div className="flex justify-end">
				<button
					onClick={onUploadAll}
					disabled={isUploading}
					className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
				>
					{isUploading ? (
						<>
							<Loader2 size={16} className="animate-spin" />{" "}
							Uploading...
						</>
					) : (
						<>
							<UploadCloud size={16} /> Upload All Files
						</>
					)}
				</button>
			</div>
		</div>
	);
}
