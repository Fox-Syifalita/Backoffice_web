import React from 'react';

const Table = ({ headers, data, actions }) => {
  const dataKeys = headers.map(header => header.toLowerCase().replace(' ', '_'));

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, rowIndex) => (
            <tr key={item.id || rowIndex} className="hover:bg-gray-50">
              {dataKeys.map((key, cellIndex) => (
                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item[key]}
                </td>
              ))}
              
              {actions && actions.length > 0 && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {actions.map((action, actionIndex) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(item._raw)}
                          className={`p-1 rounded hover:bg-gray-100 ${action.color || 'text-gray-600'}`}
                          title={action.label}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;