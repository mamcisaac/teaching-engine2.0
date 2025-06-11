import HolidaySettings from '../components/settings/HolidaySettings';
import SubstituteInfoForm from '../components/settings/SubstituteInfoForm';
import BackupButton from '../components/settings/BackupButton';

export default function SettingsPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl">Settings</h1>
      <HolidaySettings />
      <SubstituteInfoForm />
      <BackupButton />
    </div>
  );
}
