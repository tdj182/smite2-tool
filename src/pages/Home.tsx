import { Link } from 'react-router-dom';
import { godsData } from '@/lib/gods';
import { itemsData } from '@/lib/items';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div>
      <h1>Welcome to SMITE 2 Tool</h1>
      <p className="mb-8 text-lg text-text-secondary">
        A comprehensive database for SMITE 2 gods and items with validated data.
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
        <Card className="border-2 border-gods bg-gods-bg">
          <CardHeader>
            <CardTitle>Gods Database</CardTitle>
            <CardDescription>
              Browse {godsData.gods.length} gods with detailed information about roles, abilities, and strategies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-gods font-bold text-white hover:bg-gods/90">
              <Link to="/gods">View Gods</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-items bg-items-bg">
          <CardHeader>
            <CardTitle>Items Database</CardTitle>
            <CardDescription>
              Explore {itemsData.items.length} items with stats, build paths, and tier information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-items font-bold text-white hover:bg-items/90">
              <Link to="/items">View Items</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-12 bg-surface">
        <CardHeader>
          <CardTitle className="text-lg">Data Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-text-secondary">
            <li>Patch: {godsData.meta.patch}</li>
            <li>Data Version: {godsData.meta.dataVersion}</li>
            <li>Last Updated: {new Date(godsData.meta.lastUpdatedUtc).toLocaleDateString()}</li>
            <li>All data is validated with Zod schemas for type safety</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
