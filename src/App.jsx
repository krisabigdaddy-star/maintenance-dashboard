import React, { useState, useMemo } from 'react';
import { Upload, Activity, CheckCircle, Clock, AlertTriangle, Users, Calendar, BarChart3, Wrench, PlayCircle, FileSpreadsheet } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// --- Configuration & Constants ---
// SLA Standard Duration based on the provided CSV
const SLA_MAP = {
  'LOW': 30,
  'MEDIUM': 14,
  'HIGH': 5,
  'CRITICAL': 2
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

// --- Demo Data ---
const DEMO_DATA = [
  { "ชื่อเรื่อง": "B082-2026-00274", "REQUEST_DATE": "2026-06-16", "REQUESTER_DEPT": "VCP/P", "JOB_DESCRIPTION": "ท่อน้ำดับเพลิง มีสีทาหลุดร่อน พบสนิม", "JOB_STATUS": "NEW", "JOB_TYPE": "CM", "PRIORITY": "HIGH", "ASSIGNED_TO": "Thanakit A.", "Actual_Working_Day": 0 },
  { "ชื่อเรื่อง": "B082-2026-00002", "REQUEST_DATE": "2026-01-05", "REQUESTER_DEPT": "VCD/Q", "JOB_DESCRIPTION": "ประตู Office QC ชั้น 3 เปิดเลื่อนไม่ได้", "JOB_STATUS": "COMPLETED", "JOB_TYPE": "CM", "PRIORITY": "MEDIUM", "ASSIGNED_TO": "Thanakit A.", "Actual_Working_Day": 12 },
  { "ชื่อเรื่อง": "B082-2026-00001", "REQUEST_DATE": "2026-01-05", "REQUESTER_DEPT": "VCD/Q", "JOB_DESCRIPTION": "เครื่อง Cooling ไม่เย็น", "JOB_STATUS": "COMPLETED", "JOB_TYPE": "CM", "PRIORITY": "HIGH", "ASSIGNED_TO": "Suriyan N.", "Actual_Working_Day": 4 },
  { "ชื่อเรื่อง": "B082-2026-00105", "REQUEST_DATE": "2026-03-10", "REQUESTER_DEPT": "VCP/W", "JOB_DESCRIPTION": "คราบสนิม โครง IBC ผิดรูป", "JOB_STATUS": "IN-PROGRESS", "JOB_TYPE": "PM", "PRIORITY": "MEDIUM", "ASSIGNED_TO": "Vorapong K.", "Actual_Working_Day": 5 },
  { "ชื่อเรื่อง": "B082-2026-00188", "REQUEST_DATE": "2026-04-22", "REQUESTER_DEPT": "WH", "JOB_DESCRIPTION": "ไฟแสงสว่างโกดัง 2 ขาด", "JOB_STATUS": "COMPLETED", "JOB_TYPE": "CM", "PRIORITY": "LOW", "ASSIGNED_TO": "Suriyan N.", "Actual_Working_Day": 2 },
  { "ชื่อเรื่อง": "B082-2026-00201", "REQUEST_DATE": "2026-05-01", "REQUESTER_DEPT": "VCP/P", "JOB_DESCRIPTION": "ปั๊มน้ำ RO มีเสียงดังผิดปกติ", "JOB_STATUS": "COMPLETED", "JOB_TYPE": "CM", "PRIORITY": "CRITICAL", "ASSIGNED_TO": "Thanakit A.", "Actual_Working_Day": 1 },
  { "ชื่อเรื่อง": "B082-2026-00250", "REQUEST_DATE": "2026-06-05", "REQUESTER_DEPT": "HR", "JOB_DESCRIPTION": "แอร์ห้องประชุมไม่เย็น", "JOB_STATUS": "COMPLETED", "JOB_TYPE": "CM", "PRIORITY": "HIGH", "ASSIGNED_TO": "Vorapong K.", "Actual_Working_Day": 6 },
  { "ชื่อเรื่อง": "B082-2026-00266", "REQUEST_DATE": "2026-06-10", "REQUESTER_DEPT": "VCD/Q", "JOB_DESCRIPTION": "สอบเทียบเครื่องชั่งประจำปี", "JOB_STATUS": "IN-PROGRESS", "JOB_TYPE": "PM", "PRIORITY": "MEDIUM", "ASSIGNED_TO": "Suriyan N.", "Actual_Working_Day": 3 },
  { "ชื่อเรื่อง": "B082-2026-00270", "REQUEST_DATE": "2026-06-14", "REQUESTER_DEPT": "VCP/W", "JOB_DESCRIPTION": "ท่อส่งสารเคมีรั่วซึม", "JOB_STATUS": "NEW", "JOB_TYPE": "CM", "PRIORITY": "CRITICAL", "ASSIGNED_TO": "Thanakit A.", "Actual_Working_Day": 0 },
  { "ชื่อเรื่อง": "B082-2026-00271", "REQUEST_DATE": "2026-06-15", "REQUESTER_DEPT": "Safety", "JOB_DESCRIPTION": "ซ่อมถังดับเพลิงชำรุด", "JOB_STATUS": "ASSIGNED", "JOB_TYPE": "CM", "PRIORITY": "HIGH", "ASSIGNED_TO": "Vorapong K.", "Actual_Working_Day": 0 }
];

// --- Components ---
const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-4 rounded-full ${colorClass} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

// --- Main Application ---
export default function App() {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  // Load Demo Data
  const loadDemoData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(DEMO_DATA);
      setFileName('ข้อมูลจำลองระบบ (Demo Data)');
      setLoading(false);
    }, 800);
  };

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);

    // โหลดไลบรารี XLSX ผ่าน CDN แบบ Dynamic เพื่อหลีกเลี่ยงปัญหา Bundler
    if (!window.XLSX) {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error("Failed to load XLSX script", error);
        alert("ไม่สามารถโหลดไลบรารีอ่านไฟล์ Excel ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
        setLoading(false);
        return;
      }
    }

    const XLSX = window.XLSX;
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws, { raw: false, dateNF: 'yyyy-mm-dd' });
        
        const formattedData = rawData.map(row => ({
          ...row,
          Actual_Working_Day: parseFloat(row.Actual_Working_Day) || 0,
          JOB_STATUS: (row.JOB_STATUS || 'UNKNOWN').toUpperCase().trim(),
          PRIORITY: (row.PRIORITY || 'UNKNOWN').toUpperCase().trim(),
          JOB_TYPE: (row.JOB_TYPE || 'UNKNOWN').toUpperCase().trim(),
        }));
        setData(formattedData);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาตรวจสอบรูปแบบไฟล์ Excel ค่ะ");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- Data Analysis ---
  const metrics = useMemo(() => {
    if (!data.length) return null;

    const total = data.length;
    const completed = data.filter(d => d.JOB_STATUS === 'COMPLETED').length;
    const pending = total - completed;
    
    let slaMetCount = 0;
    let totalCompletedWithPriority = 0;
    let totalLeadTime = 0;

    data.forEach(d => {
      if (d.JOB_STATUS === 'COMPLETED') {
        totalLeadTime += d.Actual_Working_Day;
        const slaLimit = SLA_MAP[d.PRIORITY];
        if (slaLimit !== undefined) {
          totalCompletedWithPriority++;
          if (d.Actual_Working_Day <= slaLimit) {
            slaMetCount++;
          }
        }
      }
    });

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
      slaSuccessRate: totalCompletedWithPriority > 0 ? ((slaMetCount / totalCompletedWithPriority) * 100).toFixed(1) : 0,
      avgLeadTime: completed > 0 ? (totalLeadTime / completed).toFixed(1) : 0
    };
  }, [data]);

  // Chart Data Preparation
  const statusData = useMemo(() => {
    const counts = data.reduce((acc, curr) => {
      acc[curr.JOB_STATUS] = (acc[curr.JOB_STATUS] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [data]);

  const priorityData = useMemo(() => {
    const counts = data.reduce((acc, curr) => {
      acc[curr.PRIORITY] = (acc[curr.PRIORITY] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [data]);

  const deptData = useMemo(() => {
    const counts = data.reduce((acc, curr) => {
      const dept = curr.REQUESTER_DEPT || 'ไม่ระบุ';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts)
      .map(key => ({ name: key, jobs: counts[key] }))
      .sort((a, b) => b.jobs - a.jobs).slice(0, 7);
  }, [data]);

  const techData = useMemo(() => {
    const stats = {};
    data.forEach(d => {
      const tech = d.ASSIGNED_TO || 'ไม่ระบุ';
      if (!stats[tech]) stats[tech] = { name: tech.split(' ')[0], Completed: 0, Pending: 0 };
      if (d.JOB_STATUS === 'COMPLETED') stats[tech].Completed += 1;
      else stats[tech].Pending += 1;
    });
    return Object.values(stats).sort((a, b) => (b.Completed + b.Pending) - (a.Completed + a.Pending)).slice(0, 5);
  }, [data]);

  // Render Empty State (No Data)
  if (!data.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border border-gray-100">
          <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Wrench className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">ระบบวิเคราะห์ข้อมูลซ่อมบำรุง</h1>
          <p className="text-gray-500 mb-8">สวัสดีค่ะ คุณกฤษฏ์ เลือกอัปโหลดไฟล์ Excel เพื่อวิเคราะห์ข้อมูลจริง หรือกดดูข้อมูลตัวอย่างเพื่อทดสอบระบบได้เลยค่ะ</p>
          
          <div className="flex flex-col gap-4">
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3">
              <FileSpreadsheet className="w-5 h-5" />
              <span>อัปโหลดไฟล์ Excel ของคุณ (.xlsx)</span>
              <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
            </label>
            
            <button 
              onClick={loadDemoData}
              className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-700 px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-3"
            >
              <PlayCircle className="w-5 h-5" />
              <span>ดูข้อมูลตัวอย่าง (Demo Data)</span>
            </button>
          </div>
          
          {loading && <p className="mt-6 text-sm font-medium text-blue-600 animate-pulse">กำลังประมวลผลข้อมูล โปรดรอสักครู่...</p>}
        </div>
      </div>
    );
  }

  // Render Dashboard (With Data)
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Maintenance Performance Dashboard
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2 text-sm md:text-base">
            ไฟล์ข้อมูลปัจจุบัน: <span className="font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-md">{fileName}</span>
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => setData([])} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors">
            เคลียร์ข้อมูล
          </button>
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm flex-1 md:flex-none">
            <Upload className="w-4 h-4" />
            <span className="text-sm">อัปโหลดไฟล์ใหม่</span>
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="จำนวนใบแจ้งซ่อมทั้งหมด" value={metrics.total} icon={BarChart3} colorClass="bg-blue-500 text-blue-600" />
        <StatCard title="อัตราความสำเร็จ (Completed)" value={`${metrics.completionRate}%`} subtitle={`เสร็จแล้ว ${metrics.completed} งาน / ค้าง ${metrics.pending} งาน`} icon={CheckCircle} colorClass="bg-emerald-500 text-emerald-600" />
        <StatCard title="SLA Success Rate" value={`${metrics.slaSuccessRate}%`} subtitle="ซ่อมเสร็จภายในเวลามาตรฐาน" icon={Clock} colorClass="bg-purple-500 text-purple-600" />
        <StatCard title="เวลาดำเนินการเฉลี่ย" value={`${metrics.avgLeadTime} วัน`} subtitle="นับเฉพาะงานที่เสร็จสิ้น (Actual Day)" icon={Calendar} colorClass="bg-orange-500 text-orange-600" />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Status Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-gray-400" /> สถานะงานปัจจุบัน (Job Status)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-gray-400" /> ระดับความเร่งด่วน (Priority)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.name === 'CRITICAL' ? '#EF4444' : 
                      entry.name === 'HIGH' ? '#F59E0B' : 
                      entry.name === 'MEDIUM' ? '#3B82F6' : '#10B981'
                    } />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Requests Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" /> แผนกที่แจ้งซ่อมสูงสุด
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#4b5563'}} />
                <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="jobs" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="จำนวนงาน" barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Technician Workload & Data Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Technician Workload Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-gray-400" /> ภาระงานของช่าง (Workload)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={techData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#4b5563'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#4b5563'}} />
                <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="Completed" stackId="a" fill="#10B981" name="งานที่เสร็จแล้ว" radius={[0, 0, 4, 4]} maxBarSize={40} />
                <Bar dataKey="Pending" stackId="a" fill="#F59E0B" name="งานที่ค้างอยู่" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Jobs Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">รายการแจ้งซ่อมล่าสุด</h3>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              กำลังแสดง {Math.min(data.length, 7)} รายการล่าสุด
            </span>
          </div>
          <div className="overflow-x-auto flex-1 p-2">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-lg">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-l-lg">เลขที่เอกสาร</th>
                  <th className="px-4 py-3 font-semibold">รายละเอียด</th>
                  <th className="px-4 py-3 font-semibold">ผู้รับผิดชอบ</th>
                  <th className="px-4 py-3 font-semibold text-center">ความเร่งด่วน</th>
                  <th className="px-4 py-3 font-semibold text-center rounded-r-lg">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.slice(0, 7).map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-4 py-4 font-medium text-gray-900">{row['ชื่อเรื่อง'] || '-'}</td>
                    <td className="px-4 py-4 text-gray-600 max-w-[200px] truncate" title={row.JOB_DESCRIPTION}>
                      {row.JOB_DESCRIPTION || '-'}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{row.ASSIGNED_TO || '-'}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold
                        ${row.PRIORITY === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                          row.PRIORITY === 'HIGH' ? 'bg-orange-100 text-orange-700' : 
                          row.PRIORITY === 'MEDIUM' ? 'bg-blue-100 text-blue-700' : 
                          'bg-emerald-100 text-emerald-700'}`}>
                        {row.PRIORITY || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold
                        ${row.JOB_STATUS === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                          ['IN-PROGRESS', 'ASSIGNED'].includes(row.JOB_STATUS) ? 'bg-amber-100 text-amber-700' : 
                          'bg-gray-100 text-gray-700'}`}>
                        {row.JOB_STATUS}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
