import Protected from '../../components/Protected';
import ChessBoard from '../../components/ChessBoard';

export default function ChessPage() {
  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-8">
        <ChessBoard />
      </div>
    </Protected>
  );
}
