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
    FaRefresh: () => '🔄',
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
