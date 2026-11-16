// src/hooks/useSpatialState.js
import { useState, useMemo, useCallback } from 'react';
import { parseSpatialDataset, computeDataCenter } from '../utils/spatialParser';

export function useSpatialState(initialRawData = []) {
  const [rawData, setRawData] = useState(initialRawData);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeLayerType, setActiveLayerType] = useState('hexagon');

  const parsedData = useMemo(() => parseSpatialDataset(rawData), [rawData]);

  const filteredData = useMemo(() => {
    if (selectedCategory === 'ALL') return parsedData;
    return parsedData.filter((item) => item.category === selectedCategory);
  }, [parsedData, selectedCategory]);

  const defaultViewport = useMemo(
    () => computeDataCenter(filteredData),
    [filteredData]
  );

  const [viewport, setViewport] = useState(defaultViewport);

  const loadDataset = useCallback((newRawRecords) => {
    setRawData(newRawRecords);
    const cleaned = parseSpatialDataset(newRawRecords);
    setViewport(computeDataCenter(cleaned));
  }, []);

  return {
    parsedData,
    filteredData,
    viewport,
    setViewport,
    selectedCategory,
    setSelectedCategory,
    activeLayerType,
    setActiveLayerType,
    loadDataset,
  };
}