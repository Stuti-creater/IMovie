import { Link } from 'react-router-dom';
import { EmptyState } from '../components/States.jsx';

export default function NotFound() {
  return (
    <section className="container section">
      <EmptyState title="Page not found" hint="That page doesn't exist or has moved." action={<Link to="/" className="btn btn-gold">Back to movies</Link>} />
    </section>
  );
}
