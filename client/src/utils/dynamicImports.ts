/**
 * Dynamic import utilities for code splitting large dependencies
 */

// Chart.js dynamic imports
export const loadChartJS = async (): Promise<{
  Chart: any;
  CategoryScale: any;
  LinearScale: any;
  PointElement: any;
  LineElement: any;
  Title: any;
  Tooltip: any;
  Legend: any;
  BarElement: any;
  ArcElement: any;
}> => {
  const [
    { Chart, registerables },
    { CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement }
  ] = await Promise.all([
    import('chart.js'),
    import('chart.js')
  ]);
  
  Chart.register(...registerables);
  return { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement };
};

// FullCalendar dynamic imports
export const loadFullCalendar = async (): Promise<{
  Calendar: any;
  localizer: any;
}> => {
  const { Calendar, momentLocalizer } = await import('react-big-calendar');
  const moment = await import('moment');
  
  return {
    Calendar,
    localizer: momentLocalizer(moment.default)
  };
};

// Recharts dynamic imports
export const loadRecharts = async (): Promise<{
  LineChart: any;
  Line: any;
  BarChart: any;
  Bar: any;
  PieChart: any;
  Pie: any;
  Cell: any;
  XAxis: any;
  YAxis: any;
  CartesianGrid: any;
  Tooltip: any;
  Legend: any;
  ResponsiveContainer: any;
}> => {
  const {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
  } = await import('recharts');
  
  return {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
  };
};

// PDF generation dynamic imports
export const loadPDFLibraries = async (): Promise<{
  jsPDF: any;
  html2canvas: any;
}> => {
  const [jsPDF, html2canvas] = await Promise.all([
    import('jspdf').then(m => m.default),
    import('html2canvas').then(m => m.default)
  ]);
  
  return { jsPDF, html2canvas };
};

// DND Kit dynamic imports
export const loadDNDKit = async (): Promise<{
  DndContext: any;
  closestCenter: any;
  KeyboardSensor: any;
  PointerSensor: any;
  useSensor: any;
  useSensors: any;
  arrayMove: any;
  SortableContext: any;
  verticalListSortingStrategy: any;
  useSortable: any;
}> => {
  const [
    { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors },
    { arrayMove, SortableContext, verticalListSortingStrategy },
    { useSortable }
  ] = await Promise.all([
    import('@dnd-kit/core'),
    import('@dnd-kit/sortable'),
    import('@dnd-kit/sortable')
  ]);
  
  return {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable
  };
};