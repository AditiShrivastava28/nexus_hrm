import React, { useState, useEffect, useRef } from 'react';
import { authenticatedFetch } from '../constants';
import { 
  IconMapPin, IconBriefcase, IconCalendar, IconSparkles, 
  IconPlus, IconLaptop, IconMonitor, IconSmartphone, 
  IconHome, IconFilePlus, IconCloudUpload, IconX, IconDownload, IconTrash, IconUser, IconMail, IconLink, IconShield, IconLock, IconEye
} from './Icons';
import { User } from '../types';

// --- Types ---
interface Document {
  id: string;
  name: string;
  type: 'PDF' | 'IMAGE';
  date: string;
  size: string;
  status: 'Verified' | 'Pending';
}

const TABS = ['About', 'Job', 'Documents', 'Assets'];

// --- Components ---

const DocumentPreviewModal = ({ isOpen, onClose, doc }: { isOpen: boolean; onClose: () => void; doc: Document | null }) => {
  if (!isOpen || !doc) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl h-[85vh] rounded-2xl flex flex-col shadow-2xl border border-zinc-200 dark:border-white/10 animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-white/10 shrink-0">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg text-red-500">
                   <IconFilePlus className="w-5 h-5" /> 
                </div>
                <div>
                   <h3 className="font-bold text-zinc-900 dark:text-white leading-tight">{doc.name}</h3>
                   <p className="text-xs text-zinc-500">Document Preview • {doc.size}</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors" title="Download">
                   <IconDownload className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors" title="Close">
                   <IconX className="w-5 h-5" />
                </button>
             </div>
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 bg-zinc-100 dark:bg-black/50 p-6 overflow-y-auto custom-scrollbar flex justify-center">
             <div className="bg-white text-black p-10 shadow-lg w-full max-w-[210mm] min-h-[297mm] relative">
                
                {/* Simulated Document Content */}
                <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
                   <div>
                      <h1 className="text-2xl font-bold uppercase tracking-widest text-zinc-900">NexusHR</h1>
                      <p className="text-xs text-gray-500 font-mono mt-1">SECURE DOCUMENT VIEWER</p>
                   </div>
                   <div className="text-right">
                      <p className="font-bold text-sm">DOC-{doc.id}</p>
                      <p className="text-xs text-gray-500">{doc.date}</p>
                   </div>
                </div>

                <div className="space-y-8 font-serif">
                   <div className="text-center py-8 bg-gray-50 border border-gray-100 rounded">
                      <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide mb-2">{doc.name.replace('.pdf', '')}</h2>
                      <p className="text-sm text-gray-500">This document is officially verified by NexusHR systems.</p>
                   </div>

                   <p className="text-justify leading-relaxed text-gray-800">
                      This certificate serves as a formal acknowledgment of the document titled <strong>{doc.name}</strong>. 
                      The contents herein are classified as confidential personnel records. Access is restricted to authorized 
                      Human Resources personnel and the document owner.
                   </p>

                   <div className="grid grid-cols-2 gap-6 my-8">
                      <div className="p-4 border border-gray-200 rounded">
                         <p className="text-xs font-bold text-gray-400 uppercase mb-1">Status</p>
                         <p className="font-bold text-emerald-600 flex items-center gap-2">
                            <IconShield className="w-4 h-4" /> {doc.status}
                         </p>
                      </div>
                      <div className="p-4 border border-gray-200 rounded">
                         <p className="text-xs font-bold text-gray-400 uppercase mb-1">Digital Signature</p>
                         <p className="font-mono text-xs text-gray-600 break-all">
                            8f4a9c2b-7d1e-4f3a-9b5c-1a2b3c4d5e6f
                         </p>
                      </div>
                   </div>

                   <p className="text-justify leading-relaxed text-gray-800">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                   </p>

                   <div className="mt-20 pt-8 border-t border-gray-200 flex justify-between items-end">
                      <div>
                         <div className="h-12 w-32 mb-2 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png')] bg-contain bg-no-repeat bg-left opacity-50"></div>
                         <p className="font-bold text-sm">Authorized Signatory</p>
                         <p className="text-xs text-gray-500">Human Resources Dept.</p>
                      </div>
                      <div className="text-right">
                          <div className="inline-block border-4 border-emerald-600 text-emerald-600 font-bold text-sm px-2 py-1 transform -rotate-12 opacity-80">
                             VERIFIED
                          </div>
                      </div>
                   </div>
                </div>

             </div>
          </div>
       </div>
    </div>
  );
};

const EditProfileModal = ({ isOpen, onClose, data, onSave }: { isOpen: boolean; onClose: () => void; data: any; onSave: (d: any) => void }) => {
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    setFormData({
        dob: data.dob || '',
        gender: data.gender || '',
        marital_status: data.marital_status || '',
        blood_group: data.blood_group || '',
        personal_email: data.personal_email || '',
        address: data.address || '',
        mobile: data.mobile || '',
        avatar_url: data.avatar_url || ''
    });
  }, [data]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert("Please upload an image file.");
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        alert("File size too large. Please upload an image under 2MB.");
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        if(e.target?.result) {
            handleChange('avatar_url', e.target.result as string);
        }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
      const payload = {
        dob: formData.dob || null,
        gender: formData.gender || null,
        marital_status: formData.marital_status || null,
        blood_group: formData.blood_group || null,
        address: formData.address || null,
        personal_email: formData.personal_email || null,
        mobile: formData.mobile || null,
        avatar_url: formData.avatar_url || null
      };
      onSave(payload);
  };

  const ReadOnlyField = ({ label, value }: { label: string, value: string }) => (
      <div className="opacity-70">
        <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-bold flex items-center gap-1">
            {label} <IconLock className="w-3 h-3 text-zinc-400" />
        </label>
        <input 
            type="text" 
            value={value || '-'} 
            disabled 
            className="w-full bg-zinc-100 dark:bg-black/60 border border-zinc-200 dark:border-white/5 rounded-lg px-3 py-2.5 text-zinc-500 dark:text-zinc-400 text-sm cursor-not-allowed" 
        />
      </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-zinc-200 dark:border-white/10">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Edit Profile</h3>
          <button onClick={onClose} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <IconX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
           <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl p-4 flex gap-3 items-start">
                  <IconShield className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <div>
                      <h4 className="text-amber-800 dark:text-amber-400 text-sm font-bold">Official Records are Locked</h4>
                      <p className="text-xs text-amber-700 dark:text-amber-500/80 mt-1">
                          Fields like Name, Designation, Department, and Join Date are managed by the organization. 
                          <br/><span className="font-semibold underline cursor-pointer hover:text-amber-900">Contact Administrator</span> to request updates to these fields.
                      </p>
                  </div>
              </div>

              <h4 className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest border-b border-zinc-200 dark:border-white/5 pb-2">Official Information (Read Only)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <ReadOnlyField label="Employee ID" value={data.employeeId} />
                 <ReadOnlyField label="Full Name" value={data.name} />
                 <ReadOnlyField label="Official Email" value={data.email} />
                 <ReadOnlyField label="Department" value={data.department} />
                 <ReadOnlyField label="Designation" value={data.designation} />
                 <ReadOnlyField label="Manager" value={data.manager} />
                 <ReadOnlyField label="Join Date" value={data.joinDate} />
                 <ReadOnlyField label="Base Location" value={data.location} />
                 <ReadOnlyField label="Status" value={data.status} />
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest border-b border-cyan-100 dark:border-cyan-900/30 pb-2">Personal Information (Editable)</h4>
              
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-bold">Profile Photo</label>
                    <div className="relative group cursor-pointer border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl h-32 flex flex-col items-center justify-center hover:border-cyan-500 transition-colors">
                       <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                       {formData.avatar_url ? (
                          <img src={formData.avatar_url} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                       ) : (
                          <>
                             <IconCloudUpload className="w-6 h-6 text-zinc-400 group-hover:text-cyan-500 mb-2" />
                             <span className="text-xs text-zinc-500">Upload Photo</span>
                          </>
                       )}
                    </div>
                 </div>
                 
                 <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-bold">Current Address</label>
                        <input 
                           type="text" 
                           value={formData.address || ''} 
                           onChange={(e) => handleChange('address', e.target.value)} 
                           className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white text-sm focus:border-cyan-500 outline-none transition-colors" 
                           placeholder="House No, Street, City, State"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-bold">Mobile Number</label>
                        <input 
                           type="text" 
                           value={formData.mobile || ''} 
                           onChange={(e) => handleChange('mobile', e.target.value)} 
                           className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white text-sm focus:border-cyan-500 outline-none transition-colors" 
                           placeholder="+91 00000 00000"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-bold">Personal Email</label>
                        <input 
                           type="email" 
                           value={formData.personal_email || ''} 
                           onChange={(e) => handleChange('personal_email', e.target.value)} 
                           className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white text-sm focus:border-cyan-500 outline-none transition-colors" 
                           placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-bold">Date of Birth</label>
                        <input 
                           type="date" 
                           value={formData.dob || ''} 
                           onChange={(e) => handleChange('dob', e.target.value)} 
                           className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white text-sm focus:border-cyan-500 outline-none transition-colors" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1.5 uppercase font-bold">Blood Group</label>
                        <select 
                           value={formData.blood_group || ''} 
                           onChange={(e) => handleChange('blood_group', e.target.value)} 
                           className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-white text-sm focus:border-cyan-500 outline-none transition-colors"
                        >
                           <option value="">Select...</option>
                           <option value="A+">A+</option><option value="A-">A-</option>
                           <option value="B+">B+</option><option value="B-">B-</option>
                           <option value="O+">O+</option><option value="O-">O-</option>
                           <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        </select>
                    </div>
                 </div>
               </div>
           </div>
        </div>

        <div className="p-6 border-t border-zinc-200 dark:border-white/10 flex justify-end gap-3 bg-zinc-50 dark:bg-black/20 rounded-b-2xl">
           <button onClick={onClose} className="px-5 py-2.5 text-zinc-600 dark:text-zinc-300 font-bold text-sm hover:bg-zinc-200 dark:hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
           <button onClick={handleSubmit} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-cyan-500/20 transition-all">Save Changes</button>
        </div>
      </div>
    </div>
  );
};


const MeView: React.FC<{ user?: User | null }> = ({ user }) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('About');
  
  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authenticatedFetch('/users/me'); // Updated endpoint
        if (response.ok) {
          const data = await response.json();
          // Transform API data to fit UI needs
          setProfileData({
             ...data,
             employeeId: data.employee_id || '-',
             name: data.full_name || user?.name || '-',
             email: data.email || '-',
             department: data.department || '-',
             designation: data.role || '-',
             joinDate: data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '-',
             location: data.location || '-',
             manager: data.manager || '-',
             status: data.status || 'Active',
             // Strictly use API data or empty string for editable fields
             dob: data.dob || '',
             mobile: data.mobile || '',
             address: data.address || '',
             personal_email: data.personal_email || '',
             blood_group: data.blood_group || '',
             gender: data.gender || '',
             marital_status: data.marital_status || '',
             avatar_url: data.avatar_url || user?.avatarUrl
          });
        } else {
             // Fallback for demo when API is unreachable or fails
             setProfileData({
                 employeeId: user?.employeeId || '-',
                 name: user?.name || '-',
                 email: '-',
                 department: user?.department || '-',
                 designation: user?.role || '-',
                 joinDate: '-',
                 location: '-',
                 manager: '-',
                 status: 'Active',
                 dob: '',
                 mobile: '',
                 address: '',
                 personal_email: '',
                 blood_group: '',
                 gender: '',
                 marital_status: '',
                 avatar_url: user?.avatarUrl
             });
        }
      } catch (e) { 
          console.error(e);
          // Fallback on error
          setProfileData({
             employeeId: user?.employeeId || '-',
             name: user?.name || '-',
             email: '-',
             department: user?.department || '-',
             designation: user?.role || '-',
             joinDate: '-',
             location: '-',
             manager: '-',
             status: 'Active',
             dob: '',
             mobile: '',
             address: '',
             personal_email: '',
             blood_group: '',
             gender: '',
             marital_status: '',
             avatar_url: user?.avatarUrl
         });
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async (updatedFields: any) => {
    // In a real app, send PUT /users/me request here.
    // For now, simulate local update
    setProfileData((prev: any) => ({ ...prev, ...updatedFields }));
    setIsEditOpen(false);
    alert("Profile updated successfully!");
  };

  const handleViewDocument = (doc: Document) => {
    setPreviewDoc(doc);
    setIsPreviewOpen(true);
  };

  if (!profileData) return <div className="p-8 text-center text-zinc-500">Loading Profile...</div>;

  // Mock Documents
  const documents: Document[] = [
     { id: '101', name: 'Appointment Letter.pdf', type: 'PDF', date: 'Jan 15, 2022', size: '2.4 MB', status: 'Verified' },
     { id: '102', name: 'Aadhar Card.pdf', type: 'PDF', date: 'Jan 10, 2022', size: '1.1 MB', status: 'Verified' },
     { id: '103', name: 'PAN Card.png', type: 'IMAGE', date: 'Jan 10, 2022', size: '0.8 MB', status: 'Verified' },
     { id: '104', name: 'Experience Relieving.pdf', type: 'PDF', date: 'Jan 12, 2022', size: '3.5 MB', status: 'Pending' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
       {/* Modals */}
       <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} data={profileData} onSave={handleSaveProfile} />
       <DocumentPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} doc={previewDoc} />

       {/* Header Card */}
       <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-cyan-900 to-blue-900 relative">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40"></div>
             <div className="absolute inset-0 bg-black/20"></div>
             <button onClick={() => setIsEditOpen(true)} className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all border border-white/10">
                <IconSparkles className="w-4 h-4" /> Edit Profile
             </button>
          </div>

          <div className="px-8 pb-8">
             <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 gap-6">
                <div className="relative group">
                   <div className="w-32 h-32 rounded-2xl bg-zinc-900 p-1 ring-4 ring-white dark:ring-zinc-900 relative z-10">
                      <img src={profileData.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-xl bg-zinc-800" />
                   </div>
                   <div className="absolute bottom-2 right-2 z-20 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" title="Active"></div>
                </div>
                
                <div className="flex-1 mb-2">
                   <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                      {profileData.name} 
                      <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-bold rounded uppercase tracking-wide border border-cyan-200 dark:border-cyan-500/30">
                         {profileData.employeeId}
                      </span>
                   </h1>
                   <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                      <span className="flex items-center gap-1.5"><IconBriefcase className="w-4 h-4 text-zinc-400" /> {profileData.designation}</span>
                      <span className="flex items-center gap-1.5"><IconMapPin className="w-4 h-4 text-zinc-400" /> {profileData.location}</span>
                      <span className="flex items-center gap-1.5"><IconCalendar className="w-4 h-4 text-zinc-400" /> Joined {profileData.joinDate}</span>
                      <span className="flex items-center gap-1.5"><IconMail className="w-4 h-4 text-zinc-400" /> {profileData.email}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-8 flex gap-8 border-t border-zinc-200 dark:border-white/5 overflow-x-auto">
             {TABS.map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                   {tab}
                </button>
             ))}
          </div>
       </div>

       {/* Content Area */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Left Column: Sidebar Info */}
          <div className="space-y-6">
             {/* Quick Stats */}
             <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Work Status</h3>
                <div className="space-y-4">
                   <div>
                      <div className="flex justify-between text-sm mb-1">
                         <span className="text-zinc-600 dark:text-zinc-400">Profile Completion</span>
                         <span className="font-bold text-emerald-500">85%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 w-[85%] rounded-full"></div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                         {(profileData.name || 'U').charAt(0)}
                      </div>
                      <div>
                         <p className="text-xs font-bold text-zinc-500 uppercase">Reporting To</p>
                         <p className="text-sm font-bold text-zinc-900 dark:text-white">{profileData.manager}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Contact Info */}
             <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Contact Information</h3>
                <div className="space-y-4 text-sm">
                   <div className="flex gap-3">
                      <IconMail className="w-4 h-4 text-zinc-400 mt-0.5" />
                      <div>
                         <p className="text-zinc-500 text-xs">Personal Email</p>
                         <p className="font-medium text-zinc-800 dark:text-zinc-200">{profileData.personal_email || '-'}</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <IconSmartphone className="w-4 h-4 text-zinc-400 mt-0.5" />
                      <div>
                         <p className="text-zinc-500 text-xs">Mobile</p>
                         <p className="font-medium text-zinc-800 dark:text-zinc-200">{profileData.mobile || '-'}</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <IconHome className="w-4 h-4 text-zinc-400 mt-0.5" />
                      <div>
                         <p className="text-zinc-500 text-xs">Current Address</p>
                         <p className="font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">{profileData.address || '-'}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Column: Tab Content */}
          <div className="lg:col-span-2">
             <div key={activeTab} className="animate-in slide-in-from-right-8 fade-in duration-300">
                 {/* ABOUT TAB */}
                 {activeTab === 'About' && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-8 shadow-sm">
                       <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-6">Personal Information</h3>
                       <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                          <div>
                             <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Date of Birth</p>
                             <p className="text-zinc-800 dark:text-zinc-200 font-medium">{profileData.dob || '-'}</p>
                          </div>
                          <div>
                             <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Blood Group</p>
                             <p className="text-zinc-800 dark:text-zinc-200 font-medium">{profileData.blood_group || '-'}</p>
                          </div>
                          <div>
                             <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Marital Status</p>
                             <p className="text-zinc-800 dark:text-zinc-200 font-medium">{profileData.marital_status || '-'}</p>
                          </div>
                          <div>
                             <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Gender</p>
                             <p className="text-zinc-800 dark:text-zinc-200 font-medium">{profileData.gender || '-'}</p>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* JOB TAB */}
                 {activeTab === 'Job' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-8 shadow-sm">
                           <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-6">Job Details</h3>
                           <div className="space-y-6">
                              <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5">
                                 <div className="flex justify-between items-start">
                                    <div>
                                       <p className="font-bold text-zinc-900 dark:text-white">{profileData.designation}</p>
                                       <p className="text-sm text-zinc-500">{profileData.department} • Full Time</p>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-500/20">Active</span>
                                 </div>
                                 <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/10 grid grid-cols-2 gap-4">
                                    <div>
                                       <p className="text-xs text-zinc-500">Date of Joining</p>
                                       <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{profileData.joinDate}</p>
                                    </div>
                                    <div>
                                       <p className="text-xs text-zinc-500">Work Location</p>
                                       <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{profileData.location}</p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                    </div>
                 )}

                 {/* DOCUMENTS TAB */}
                 {activeTab === 'Documents' && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-8 shadow-sm">
                       <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">My Documents</h3>
                          <button className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 px-3 py-2 rounded-lg transition-colors">
                             <IconCloudUpload className="w-4 h-4" /> Upload New
                          </button>
                       </div>
                       <div className="space-y-3">
                          {documents.map((doc) => (
                             <div key={doc.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${doc.type === 'PDF' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-500'}`}>
                                      {doc.type === 'PDF' ? <IconFilePlus className="w-5 h-5" /> : <IconLink className="w-5 h-5" />}
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{doc.name}</p>
                                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                                         <span>{doc.date}</span> • <span>{doc.size}</span>
                                         {doc.status === 'Verified' && <span className="text-emerald-500 flex items-center gap-0.5"><IconShield className="w-3 h-3" /> Verified</span>}
                                      </div>
                                   </div>
                                </div>
                                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => handleViewDocument(doc)}
                                     className="px-3 py-1.5 bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-2 shadow-sm"
                                   >
                                      <IconEye className="w-3.5 h-3.5" /> View
                                   </button>
                                   <button className="p-2 bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-sm">
                                      <IconDownload className="w-3.5 h-3.5" />
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}

                 {/* ASSETS TAB */}
                 {activeTab === 'Assets' && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 p-8 shadow-sm">
                       <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-6">Assigned Assets</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 flex gap-4">
                             <div className="p-3 bg-zinc-200 dark:bg-white/10 rounded-xl h-fit text-zinc-500 dark:text-zinc-400">
                                <IconLaptop className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="font-bold text-zinc-900 dark:text-white text-sm">MacBook Pro M2</p>
                                <p className="text-xs text-zinc-500 mt-1">Serial: C02XG...</p>
                                <p className="text-xs text-zinc-500">Assigned: Jan 2022</p>
                             </div>
                          </div>
                          <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 flex gap-4">
                             <div className="p-3 bg-zinc-200 dark:bg-white/10 rounded-xl h-fit text-zinc-500 dark:text-zinc-400">
                                <IconMonitor className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="font-bold text-zinc-900 dark:text-white text-sm">Dell UltraSharp 27"</p>
                                <p className="text-xs text-zinc-500 mt-1">Serial: CN-0...</p>
                                <p className="text-xs text-zinc-500">Assigned: Jan 2022</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
             </div>
          </div>

       </div>
    </div>
  );
};

export default MeView;