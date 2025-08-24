import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function DocumentFilters({ selectedFilter, onFilterChange }) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-slate-500" />
      <Select value={selectedFilter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-40 bg-white/80">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="text">Text Files</SelectItem>
          <SelectItem value="pdf">PDF Files</SelectItem>
          <SelectItem value="audio">Audio Files</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}