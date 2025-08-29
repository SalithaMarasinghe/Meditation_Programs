import { Download, FileText, File, FileArchive, FileImage } from 'lucide-react';

interface ResourcesDownloadProps {
  resources: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export const ResourcesDownload = ({ resources }: ResourcesDownloadProps) => {
  if (!resources || resources.length === 0) return null;

const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'zip':
      case 'rar':
        return <FileArchive className="w-5 h-5 text-yellow-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="w-5 h-5 text-blue-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Downloadable Resources</h3>
      
      <div className="space-y-3">
        {resources.map((resource, index) => {
          const fileExtension = resource.type.toLowerCase();
          return (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-md bg-gray-100">
                  {getFileIcon(fileExtension)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                  <p className="text-xs text-gray-500">
                    {fileExtension.toUpperCase()} • {Math.round(Math.random() * 5) + 1} MB
                  </p>
                </div>
              </div>
              <a
                href={resource.url}
                download={resource.name}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourcesDownload;
