import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Spatial Design Tool</h1>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link href="/gestrueControl" className="text-blue-500 hover:underline">
              Gesture Control
            </Link>
          </li>
          <li>
            <Link href="/test3" className="text-blue-500 hover:underline">
              Test 3
            </Link>
          </li>
          <li>
            <Link href="/test2" className="text-blue-500 hover:underline">
              Test 2
            </Link>
          </li>
          <li>
            <Link href="/worldbuild" className="text-blue-500 hover:underline">
              World Build
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
