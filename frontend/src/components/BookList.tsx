import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { apiService } from '../services/api';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '' });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const booksData = await apiService.getBooks();
      setBooks(booksData);
    } catch (error: any) {
      toast.error('Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Generate a unique ID for the book
      const bookWithId = {
        ...newBook,
        id: Date.now().toString()
      };
      const book = await apiService.createBook(bookWithId);
      setBooks([...books, book]);
      setNewBook({ title: '', author: '' });
      setShowAddForm(false);
      toast.success('Book added successfully!');
    } catch (error: any) {
      toast.error('Failed to add book');
    }
  };

  const handleDeleteBook = async (id: string) => {
    try {
      await apiService.deleteBook(id);
      setBooks(books.filter(book => book.id !== id));
      toast.success('Book deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete book');
    }
  };

  const handleOrderBook = async (book: Book) => {
    try {
      await apiService.placeOrder({ book_id: book.id });
      toast.success(`Order placed for "${book.title}"! Check notifications.`);
    } catch (error: any) {
      toast.error('Failed to place order');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Books</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Book</h3>
          <form onSubmit={handleAddBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Author</label>
              <input
                type="text"
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Book
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                <p className="text-gray-600">by {book.author}</p>
              </div>
              <button
                onClick={() => handleDeleteBook(book.id)}
                className="text-red-600 hover:text-red-800"
                title="Delete book"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleOrderBook(book)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Order
              </button>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No books available. Add your first book!</p>
        </div>
      )}
    </div>
  );
};

export default BookList; 