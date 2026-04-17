import { useOutletContext } from 'react-router-dom';
import Analytics from '../../components/vendor/Analytics';
import { type Stall } from '../../types/stall.types';

export default function VendorAnalytics() {
	const { stall } = useOutletContext<{ stall: Stall }>();

	if (!stall) return null;

	return <Analytics stallId={stall.id} />;
}
