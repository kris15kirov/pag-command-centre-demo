import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock react-icons
jest.mock('react-icons/fa', () => ({
    FaEthereum: () => '🟡',
    FaTelegram: () => '📱',
    FaTwitter: () => '🐦',
    FaCopy: () => '📋',
    FaSync: () => '🔄',
}));

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(),
    },
});

describe('PAG Command Centre Dashboard', () => {
    const mockMessages = [
        {
            id: '1',
            source: 'Telegram',
            sender: '@Web3Dev',
            text: 'Urgent audit for Uniswap fork',
            category: 'urgent',
            timestamp: '2025-08-12T10:00:00Z'
        }
    ];

    beforeEach(() => {
        axios.get.mockClear();
        navigator.clipboard.writeText.mockClear();
    });

    test('renders basic dashboard structure', async () => {
        axios.get.mockResolvedValue({ data: mockMessages });

        render(<App />);

        // Wait for the component to finish loading
        await waitFor(() => {
            expect(screen.getByText(/Filters/)).toBeInTheDocument();
        });
    });

    test('renders messages when API call succeeds', async () => {
        axios.get.mockResolvedValue({ data: mockMessages });

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Urgent audit for Uniswap fork')).toBeInTheDocument();
        });
    });

    test('handles API errors gracefully', async () => {
        axios.get.mockRejectedValue(new Error('API Error'));

        render(<App />);

        // Should not crash and should show some UI
        await waitFor(() => {
            expect(screen.getByText(/Filters/)).toBeInTheDocument();
        });
    });
});

test('updates category via dropdown', async () => {
  const mockPost = jest.fn().mockResolvedValue({ status: 200 });
  axios.get.mockResolvedValue({
    data: [{ id: '1', source: 'TELEGRAM', sender: '@Web3Dev', content: 'Urgent audit', category: 'urgent', timestamp: '2025-08-14T10:00:00Z' }]
  });
  axios.post = mockPost;
  render(<App />);
  await screen.findByText('Urgent audit');

  const select = screen.getByRole('combobox');
  fireEvent.change(select, { target: { value: 'high_priority' } });
  expect(mockPost).toHaveBeenCalledWith('http://localhost:8000/api/messages/1/category', { category: 'high_priority' });
});

test('sorts Telegram above Twitter', async () => {
  axios.get.mockResolvedValue({
    data: [
      { id: '1', source: 'TELEGRAM', sender: '@Web3Dev', content: 'Urgent audit', category: 'urgent', timestamp: '2025-08-14T10:00:00Z' },
      { id: '2', source: 'TWITTER', sender: '@CryptoFan', content: 'Aave query', category: 'high_priority', timestamp: '2025-08-14T10:05:00Z' }
    ]
  });
  render(<App />);
  const messages = await screen.findAllByText(/Urgent audit|Aave query/);
  expect(messages[0].textContent).toContain('Urgent audit');
  expect(messages[1].textContent).toContain('Aave query');
});

test('adds new template', () => {
  render(<App />);
  const addButton = screen.getByText('Add New Template');
  fireEvent.click(addButton);
  
  const textarea = screen.getByPlaceholderText(/Enter your custom response template/);
  fireEvent.change(textarea, { target: { value: 'New template test' } });
  
  const saveButton = screen.getByText('Save Template');
  fireEvent.click(saveButton);
  
  expect(screen.getByText('New template test')).toBeInTheDocument();
});

test('deletes template with confirmation', () => {
  render(<App />);
  
  // Mock window.confirm to return true
  const originalConfirm = window.confirm;
  window.confirm = jest.fn(() => true);
  
  const deleteButtons = screen.getAllByTestId('delete-template');
  if (deleteButtons.length > 0) {
    fireEvent.click(deleteButtons[0]);
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this template?');
  }
  
  // Restore original confirm
  window.confirm = originalConfirm;
});

test('copies template to clipboard', () => {
  render(<App />);
  
  // Mock navigator.clipboard
  const mockClipboard = {
    writeText: jest.fn().mockResolvedValue(undefined),
  };
  Object.assign(navigator, { clipboard: mockClipboard });
  
  const copyButtons = screen.getAllByText('Copy');
  if (copyButtons.length > 0) {
    fireEvent.click(copyButtons[0]);
    expect(mockClipboard.writeText).toHaveBeenCalled();
  }
});

test('renders template drag handles', () => {
  render(<App />);
  
  // Check for drag handle icons (FaGripVertical)
  const dragHandles = screen.getAllByTestId('drag-handle');
  expect(dragHandles.length).toBeGreaterThan(0);
});
