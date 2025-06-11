import { renderWithRouter } from '../test-utils';
import WeekResources from '../components/WeekResources';

test('renders download button', () => {
  const { getByText } = renderWithRouter(<WeekResources week={{ id: 1 }} />);
  expect(getByText('Download All')).toBeInTheDocument();
});
