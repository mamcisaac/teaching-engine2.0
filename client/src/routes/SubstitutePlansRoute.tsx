/**
 * SubstitutePlansRoute
 * Route configuration for substitute plans feature
 */

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import SubstitutePlansPage from '../pages/SubstitutePlansPage';

export const SubstitutePlansRoute: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SubstitutePlansPage />} />
      <Route path="/new" element={<div>Create New Substitute Plan (TODO)</div>} />
      <Route path="/:id/edit" element={<div>Edit Substitute Plan (TODO)</div>} />
    </Routes>
  );
};

export default SubstitutePlansRoute;