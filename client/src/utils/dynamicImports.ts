/**
 * Dynamic import utilities for code splitting large dependencies
 */

// Chart.js types
interface ChartJSModule {
  Chart: typeof import('chart.js').Chart;
  CategoryScale: typeof import('chart.js').CategoryScale;
  LinearScale: typeof import('chart.js').LinearScale;
  PointElement: typeof import('chart.js').PointElement;
  LineElement: typeof import('chart.js').LineElement;
  Title: typeof import('chart.js').Title;
  Tooltip: typeof import('chart.js').Tooltip;
  Legend: typeof import('chart.js').Legend;
  BarElement: typeof import('chart.js').BarElement;
  ArcElement: typeof import('chart.js').ArcElement;
}

// FullCalendar types
interface FullCalendarModule {
  Calendar: React.ComponentType<Record<string, unknown>>;
  localizer: Record<string, unknown>;
}

// Recharts types
interface RechartsModule {
  LineChart: React.ComponentType<Record<string, unknown>>;
  Line: React.ComponentType<Record<string, unknown>>;
  BarChart: React.ComponentType<Record<string, unknown>>;
  Bar: React.ComponentType<Record<string, unknown>>;
  PieChart: React.ComponentType<Record<string, unknown>>;
  Pie: React.ComponentType<Record<string, unknown>>;
  Cell: React.ComponentType<Record<string, unknown>>;
  XAxis: React.ComponentType<Record<string, unknown>>;
  YAxis: React.ComponentType<Record<string, unknown>>;
  CartesianGrid: React.ComponentType<Record<string, unknown>>;
  Tooltip: React.ComponentType<Record<string, unknown>>;
  Legend: React.ComponentType<Record<string, unknown>>;
  ResponsiveContainer: React.ComponentType<Record<string, unknown>>;
}

// PDF libraries types
interface PDFModule {
  jsPDF: new (...args: unknown[]) => Record<string, unknown>;
  html2canvas: (element: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
}

// DND Kit types
interface DNDKitModule {
  DndContext: React.ComponentType<Record<string, unknown>>;
  closestCenter: Record<string, unknown>;
  KeyboardSensor: new (...args: unknown[]) => Record<string, unknown>;
  PointerSensor: new (...args: unknown[]) => Record<string, unknown>;
  useSensor: (...args: unknown[]) => Record<string, unknown>;
  useSensors: (...args: unknown[]) => Record<string, unknown>;
  arrayMove: <T>(array: T[], oldIndex: number, newIndex: number) => T[];
  SortableContext: React.ComponentType<Record<string, unknown>>;
  verticalListSortingStrategy: Record<string, unknown>;
  useSortable: (options: Record<string, unknown>) => Record<string, unknown>;
}

// Chart.js dynamic imports
export const loadChartJS = async (): Promise<ChartJSModule> => {
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
export const loadFullCalendar = async (): Promise<FullCalendarModule> => {
  const { Calendar, momentLocalizer } = await import('react-big-calendar');
  const moment = await import('moment');
  
  return {
    Calendar,
    localizer: momentLocalizer(moment.default)
  };
};

// Recharts dynamic imports
export const loadRecharts = async (): Promise<RechartsModule> => {
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
export const loadPDFLibraries = async (): Promise<PDFModule> => {
  const [jsPDF, html2canvas] = await Promise.all([
    import('jspdf').then(m => m.default as PDFModule['jsPDF']),
    import('html2canvas').then(m => m.default as PDFModule['html2canvas'])
  ]);
  
  return { jsPDF, html2canvas };
};

// DND Kit dynamic imports
export const loadDNDKit = async (): Promise<DNDKitModule> => {
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