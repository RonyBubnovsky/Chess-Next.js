import Protected from '../../components/Protected';
import ChessBoard from '../../components/ChessBoard';

export default function ChessPage() {
  return (
    <Protected>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-6">Chess Game</h1>
        <ChessBoard />
      </div>
    </Protected>
  );
}
