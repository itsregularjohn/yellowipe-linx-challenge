import type { FC } from 'react';
import { Layout } from '../../core/components/Layout';
import { UpdateEmailForm } from '../components/UpdateEmailForm';
import { UpdatePasswordForm } from '../components/UpdatePasswordForm';

export const SettingsPage: FC = () => {
  return (
    <Layout title="Settings">
      <div className="space-y-8">
        <UpdateEmailForm />
        <UpdatePasswordForm />
      </div>
    </Layout>
  );
};