import React, { useState } from "react";
import {
    FaChevronDown,
    FaChevronUp,
} from "react-icons/fa";
import { IconType } from "react-icons";

export interface FieldDefinition {
    label: string;
    key: string;
    icon?: IconType;
}

interface InfoTableProps {
    title: string;
    fields: readonly FieldDefinition[];
    data: any;
    isLoading?: boolean;
    // Editable props
    isEditable?: boolean;
    manualData?: any;
    manualOverrides?: Record<string, boolean>;
    onOverrideToggle?: (key: string) => void;
    onManualDataChange?: (key: string, value: string) => void;
    validationErrors?: Record<string, string>;
    // Expandable props
    initialVisibleRows?: number;
    expandLabel?: string;
    collapseLabel?: string;
    // Two columns props
    twoColumns?: boolean;
}

export default function InfoTable({
    title,
    fields,
    data,
    isLoading = false,
    isEditable = false,
    manualData,
    manualOverrides,
    onOverrideToggle,
    onManualDataChange,
    validationErrors,
    initialVisibleRows,
    expandLabel = "Vis mere",
    collapseLabel = "Vis mindre",
    twoColumns = false,
}: InfoTableProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const useTwoColumns = twoColumns && !isEditable;

    // Helper to format value
    const formatValue = (key: string) => {
        let displayValue = data?.[key];
        if (typeof displayValue === 'number') {
            displayValue = displayValue.toLocaleString('da-DK', { maximumFractionDigits: 2 });
        }
        if (displayValue === undefined || displayValue === null) displayValue = "-";
        return displayValue;
    };

    // Group fields if using two columns
    const rows = useTwoColumns
        ? Array.from({ length: Math.ceil(fields.length / 2) }, (_, i) => [
            fields[i * 2],
            fields[i * 2 + 1]
        ])
        : fields.map(f => [f]);

    // If initialVisibleRows is defined, use it. Otherwise show all.
    const shouldExpand = initialVisibleRows !== undefined && rows.length > initialVisibleRows;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
            <div className="bg-gray-50 rounded-xl p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                        <tr>
                            {useTwoColumns ? (
                                <>
                                    <th className="p-1.5 border-b-2 border-gray-200 text-sm font-semibold text-gray-700 w-[30%]"></th>
                                    <th className="p-1.5 border-b-2 border-gray-200 text-sm font-semibold text-gray-700 w-[20%]">Værdi</th>
                                    <th className="p-1.5 border-b-2 border-gray-200 text-sm font-semibold text-gray-700 w-[30%]"></th>
                                    <th className="p-1.5 border-b-2 border-gray-200 text-sm font-semibold text-gray-700 w-[20%]">Værdi</th>
                                </>
                            ) : (
                                <>
                                    <th className={`p-1.5 border-b-2 border-gray-200 text-sm font-semibold text-gray-700 ${isEditable ? 'w-[30%]' : 'w-[50%]'}`}></th>
                                    <th className={`p-1.5 border-b-2 border-gray-200 text-sm font-semibold text-gray-700 ${isEditable ? 'w-[20%]' : 'w-[50%]'}`}>
                                        {isEditable ? "Indlæst værdi" : "Værdi"}
                                    </th>
                                    {isEditable && (
                                        <>
                                            <th className="p-1.5 border-b-2 border-gray-200 text-sm font-semibold text-gray-700 text-center w-[10%]">
                                                Rediger
                                            </th>
                                            <th className="p-1.5 border-b-2 border-gray-200 text-sm font-semibold text-gray-700 w-[40%]">
                                                Manuel værdi
                                            </th>
                                        </>
                                    )}
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((rowFields, index) => {
                            const isCollapsible = shouldExpand && index >= (initialVisibleRows || 0);
                            const isHidden = isCollapsible && !isExpanded;

                            return (
                                <tr
                                    key={index}
                                    className={`transition-all duration-500 ease-in-out ${isHidden ? 'border-none' : 'border-b border-gray-100 hover:bg-white'}`}
                                >
                                    {rowFields.map((field, fieldIndex) => {
                                        if (!field) return <React.Fragment key={`empty-${fieldIndex}`}><td /><td /></React.Fragment>; // Handle odd last row

                                        return (
                                            <React.Fragment key={field.key}>
                                                <td className={`text-sm text-gray-800 font-medium transition-all duration-500 ${isHidden ? 'p-0' : 'p-1.5'}`}>
                                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out bg-transparent ${isHidden ? 'max-h-0 opacity-0 translate-y-2' : 'max-h-24 opacity-100 translate-y-0'}`}>
                                                        <div className="flex items-center gap-1.5 h-10 px-1">
                                                            {field.icon && <field.icon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                                                            <span title={field.label} className="truncate">{field.label}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`text-sm text-gray-600 align-middle transition-all duration-500 ${isHidden ? 'p-0' : 'p-1.5'}`}>
                                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isHidden ? 'max-h-0 opacity-0 translate-y-2' : 'max-h-24 opacity-100 translate-y-0'}`}>
                                                        <div className="flex items-center h-10 px-1">
                                                            {isLoading ? (
                                                                <div className="animate-pulse h-3 w-20 bg-gray-200 rounded"></div>
                                                            ) : (
                                                                <span className="truncate block w-full">{formatValue(field.key)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Edit columns only if standard single column mode */}
                                                {!useTwoColumns && isEditable && (
                                                    <>
                                                        <td className={`text-center align-middle transition-all duration-500 ${isHidden ? 'p-0' : 'p-1.5'}`}>
                                                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isHidden ? 'max-h-0 opacity-0 translate-y-2' : 'max-h-24 opacity-100 translate-y-0'}`}>
                                                                <div className="flex items-center justify-center h-10">
                                                                    <button
                                                                        onClick={() => onOverrideToggle && onOverrideToggle(field.key)}
                                                                        className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:ring-offset-1 cursor-pointer ${manualOverrides?.[field.key] ? 'bg-emerald-600' : 'bg-gray-200'
                                                                            }`}
                                                                    >
                                                                        <span
                                                                            className={`${manualOverrides?.[field.key] ? 'translate-x-4' : 'translate-x-0.5'
                                                                                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={`transition-all duration-500 ${isHidden ? 'p-0' : 'p-1.5'}`}>
                                                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isHidden ? 'max-h-0 opacity-0 translate-y-2' : 'max-h-24 opacity-100 translate-y-0'}`}>
                                                                <div className="flex items-center h-10">
                                                                    <input
                                                                        type="text"
                                                                        disabled={!manualOverrides?.[field.key]}
                                                                        value={manualData?.[field.key] || ""}
                                                                        onChange={(e) => onManualDataChange && onManualDataChange(field.key, e.target.value)}
                                                                        className={`w-full px-2 py-1.5 text-sm rounded border focus:ring-1 focus:outline-none transition-colors ${manualOverrides?.[field.key]
                                                                            ? validationErrors?.[field.key]
                                                                                ? "bg-white border-red-500 text-gray-900 focus:ring-red-500"
                                                                                : "bg-white border-gray-300 text-gray-900 focus:ring-emerald-500"
                                                                            : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                                                            }`}
                                                                        placeholder={manualOverrides?.[field.key] ? "Indtast værdi..." : ""}
                                                                    />
                                                                </div>
                                                                {manualOverrides?.[field.key] && validationErrors?.[field.key] && (
                                                                    <p className="text-sm text-red-600 mt-1">{validationErrors[field.key]}</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            );
                        })}

                        {shouldExpand && (
                            <tr>
                                <td colSpan={useTwoColumns ? 4 : (isEditable ? 4 : 2)} className="p-3 text-center">
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="group inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer border border-emerald-100"
                                    >
                                        {isExpanded ? (
                                            <>
                                                <FaChevronUp className="w-3 h-3 transition-transform group-hover:-translate-y-0.5" />
                                                {collapseLabel}
                                            </>
                                        ) : (
                                            <>
                                                <FaChevronDown className="w-3 h-3 transition-transform group-hover:translate-y-0.5" />
                                                {expandLabel}
                                            </>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
