import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import axios from 'axios';

// Mock axios
jest.mock('axios');

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
        },
        {
            id: '2',
            source: 'Twitter',
            sender: '@CryptoFounder',
            text: '@KrumPashov Aave integration query',
            category: 'high',
            timestamp: '2025-08-12T10:05:00Z'
        },
        {
            id: '3',
            source: 'Telegram',
            sender: '@NFTCreator',
            text: 'Need Sofamon NFT audit',
            category: 'high',
            timestamp: '2025-08-12T10:10:00Z'
        },
        {
            id: '4',
            source: 'Twitter',
            sender: '@DeFiGuru',
            text: '@KrumPashov LayerZero bridge audit?',
            category: 'routine',
            timestamp: '2025-08-12T10:15:00Z'
        }
    ];

    beforeEach(() => {
        axios.get.mockClear();
        navigator.clipboard.writeText.mockClear();
    });

    describe('Dashboard Rendering', () => {
        test('renders dashboard with all main sections', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            // Check main sections
            expect(screen.getByText('Filters')).toBeInTheDocument();
            expect(screen.getByText('Messages')).toBeInTheDocument();
            expect(screen.getByText('Reply Templates')).toBeInTheDocument();

            // Wait for messages to load
            await waitFor(() => {
                expect(screen.getByText('Urgent audit for Uniswap fork')).toBeInTheDocument();
            });
        });

        test('renders category filter buttons', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            // Check category filters
            expect(screen.getByText('All')).toBeInTheDocument();
            expect(screen.getByText('Urgent')).toBeInTheDocument();
            expect(screen.getByText('High')).toBeInTheDocument();
            expect(screen.getByText('Routine')).toBeInTheDocument();
            expect(screen.getByText('Archive')).toBeInTheDocument();
        });

        test('renders project filter buttons', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            // Check project filters
            expect(screen.getByText('None')).toBeInTheDocument();
            expect(screen.getByText('Uniswap')).toBeInTheDocument();
            expect(screen.getByText('Aave')).toBeInTheDocument();
            expect(screen.getByText('LayerZero')).toBeInTheDocument();
            expect(screen.getByText('Ethena')).toBeInTheDocument();
            expect(screen.getByText('Sushi')).toBeInTheDocument();
        });
    });

    describe('Message Display', () => {
        test('displays messages with correct information', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            await waitFor(() => {
                // Check message content
                expect(screen.getByText('Urgent audit for Uniswap fork')).toBeInTheDocument();
                expect(screen.getByText('@KrumPashov Aave integration query')).toBeInTheDocument();
                expect(screen.getByText('Need Sofamon NFT audit')).toBeInTheDocument();
                expect(screen.getByText('@KrumPashov LayerZero bridge audit?')).toBeInTheDocument();
            });
        });

        test('displays message sources correctly', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            await waitFor(() => {
                // Check source indicators
                expect(screen.getByText('📱 @Web3Dev')).toBeInTheDocument();
                expect(screen.getByText('🐦 @CryptoFounder')).toBeInTheDocument();
                expect(screen.getByText('📱 @NFTCreator')).toBeInTheDocument();
                expect(screen.getByText('🐦 @DeFiGuru')).toBeInTheDocument();
            });
        });

        test('displays message categories correctly', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            await waitFor(() => {
                // Check category dropdowns
                const categorySelects = screen.getAllByRole('combobox');
                expect(categorySelects).toHaveLength(4);

                // Check first message category
                expect(categorySelects[0]).toHaveValue('urgent');
            });
        });
    });

    describe('Category Filtering', () => {
        test('filters messages by urgent category', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('Urgent audit for Uniswap fork')).toBeInTheDocument();
                expect(screen.getByText('@KrumPashov Aave integration query')).toBeInTheDocument();
            });

            // Click urgent filter
            const urgentButton = screen.getByText('Urgent');
            fireEvent.click(urgentButton);

            // Should only show urgent messages
            expect(screen.getByText('Urgent audit for Uniswap fork')).toBeInTheDocument();
            expect(screen.queryByText('@KrumPashov Aave integration query')).not.toBeInTheDocument();
            expect(screen.queryByText('Need Sofamon NFT audit')).not.toBeInTheDocument();
            expect(screen.queryByText('@KrumPashov LayerZero bridge audit?')).not.toBeInTheDocument();
        });

        test('filters messages by high category', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('Urgent audit for Uniswap fork')).toBeInTheDocument();
            });

            // Click high filter
            const highButton = screen.getByText('High');
            fireEvent.click(highButton);

            // Should show high priority messages
            expect(screen.getByText('@KrumPashov Aave integration query')).toBeInTheDocument();
            expect(screen.getByText('Need Sofamon NFT audit')).toBeInTheDocument();
            expect(screen.queryByText('Urgent audit for Uniswap fork')).not.toBeInTheDocument();
            expect(screen.queryByText('@KrumPashov LayerZero bridge audit?')).not.toBeInTheDocument();
        });

        test('shows all messages when All filter is selected', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('Urgent audit for Uniswap fork')).toBeInTheDocument();
            });

            // Click all filter
            const allButton = screen.getByText('All');
            fireEvent.click(allButton);

            // Should show all messages
            expect(screen.getByText('Urgent audit for Uniswap fork')).toBeInTheDocument();
            expect(screen.getByText('@KrumPashov Aave integration query')).toBeInTheDocument();
            expect(screen.getByText('Need Sofamon NFT audit')).toBeInTheDocument();
            expect(screen.getByText('@KrumPashov LayerZero bridge audit?')).toBeInTheDocument();
        });
    });

    describe('Project Filtering', () => {
        test('filters messages by Uniswap project', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('Urgent audit for Uniswap fork')).toBeInTheDocument();
            });

            // Click Uniswap filter
            const uniswapButton = screen.getByText('Uniswap');
            fireEvent.click(uniswapButton);

            // Should only show Uniswap-related messages
            expect(screen.getByText('Urgent audit for Uniswap fork')).toBeInTheDocument();
            expect(screen.queryByText('@KrumPashov Aave integration query')).not.toBeInTheDocument();
            expect(screen.queryByText('Need Sofamon NFT audit')).not.toBeInTheDocument();
            expect(screen.queryByText('@KrumPashov LayerZero bridge audit?')).not.toBeInTheDocument();
        });

        test('filters messages by Aave project', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('@KrumPashov Aave integration query')).toBeInTheDocument();
            });

            // Click Aave filter
            const aaveButton = screen.getByText('Aave');
            fireEvent.click(aaveButton);

            // Should only show Aave-related messages
            expect(screen.getByText('@KrumPashov Aave integration query')).toBeInTheDocument();
            expect(screen.queryByText('Urgent audit for Uniswap fork')).not.toBeInTheDocument();
            expect(screen.queryByText('Need Sofamon NFT audit')).not.toBeInTheDocument();
            expect(screen.queryByText('@KrumPashov LayerZero bridge audit?')).not.toBeInTheDocument();
        });
    });

    describe('Category Updates', () => {
        test('updates message category when dropdown changes', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });
            axios.post.mockResolvedValue({ data: { success: true } });

            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('Urgent audit for Uniswap fork')).toBeInTheDocument();
            });

            // Get category dropdown for first message
            const categorySelects = screen.getAllByRole('combobox');
            const firstSelect = categorySelects[0];

            // Change category from urgent to high
            fireEvent.change(firstSelect, { target: { value: 'high' } });

                   // Verify API call was made
       expect(axios.post).toHaveBeenCalledWith(
         'http://localhost:8000/api/messages/1/category',
         { category: 'high' }
       );
        });
    });

    describe('Reply Templates', () => {
        test('displays reply templates', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            // Check template content
            expect(screen.getByText(/Thanks for your audit request/)).toBeInTheDocument();
            expect(screen.getByText(/Pashov Audit Group/)).toBeInTheDocument();
            expect(screen.getByText(/We've successfully audited/)).toBeInTheDocument();
        });

        test('copies reply template to clipboard', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            // Get copy buttons
            const copyButtons = screen.getAllByText('Copy');
            const firstCopyButton = copyButtons[0];

            // Click copy button
            fireEvent.click(firstCopyButton);

            // Verify clipboard API was called
            expect(navigator.clipboard.writeText).toHaveBeenCalled();
        });

        test('copies correct template text', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            // Get copy buttons
            const copyButtons = screen.getAllByText('Copy');
            const firstCopyButton = copyButtons[0];

            // Click copy button
            fireEvent.click(firstCopyButton);

            // Verify the correct template was copied
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('Thanks for your audit request')
            );
        });
    });

    describe('Refresh Functionality', () => {
        test('refreshes messages when refresh button is clicked', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('Urgent audit for Uniswap fork')).toBeInTheDocument();
            });

            // Click refresh button
            const refreshButton = screen.getByText('Refresh Messages');
            fireEvent.click(refreshButton);

                   // Verify refresh API call was made
       expect(axios.post).toHaveBeenCalledWith('http://localhost:8000/api/refresh');
        });
    });

    describe('Web3-Specific Features', () => {
        test('highlights messages mentioning audited projects', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            await waitFor(() => {
                // Check for project badges
                expect(screen.getByText('Uniswap')).toBeInTheDocument();
                expect(screen.getByText('Aave')).toBeInTheDocument();
                expect(screen.getByText('LayerZero')).toBeInTheDocument();
            });
        });

        test('displays project badges correctly', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            render(<App />);

            await waitFor(() => {
                // Check that project names appear as badges
                const uniswapBadge = screen.getByText('Uniswap');
                const aaveBadge = screen.getByText('Aave');
                const layerzeroBadge = screen.getByText('LayerZero');

                // These should be styled as badges
                expect(uniswapBadge).toHaveClass('bg-web3-neon');
                expect(aaveBadge).toHaveClass('bg-web3-neon');
                expect(layerzeroBadge).toHaveClass('bg-web3-neon');
            });
        });
    });

    describe('Error Handling', () => {
        test('handles API errors gracefully', async () => {
            axios.get.mockRejectedValue(new Error('API Error'));

            render(<App />);

            // Should not crash and should show some UI
            expect(screen.getByText('Filters')).toBeInTheDocument();
            expect(screen.getByText('Messages')).toBeInTheDocument();
            expect(screen.getByText('Reply Templates')).toBeInTheDocument();
        });

        test('handles empty message list', async () => {
            axios.get.mockResolvedValue({ data: [] });

            render(<App />);

            await waitFor(() => {
                // Should still render the dashboard structure
                expect(screen.getByText('Filters')).toBeInTheDocument();
                expect(screen.getByText('Messages')).toBeInTheDocument();
                expect(screen.getByText('Reply Templates')).toBeInTheDocument();
            });
        });
    });

    describe('Responsive Design', () => {
        test('renders on mobile viewport', async () => {
            axios.get.mockResolvedValue({ data: mockMessages });

            // Set mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });

            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('Urgent audit for Uniswap fork')).toBeInTheDocument();
            });

            // Should still render all main sections
            expect(screen.getByText('Filters')).toBeInTheDocument();
            expect(screen.getByText('Messages')).toBeInTheDocument();
            expect(screen.getByText('Reply Templates')).toBeInTheDocument();
        });
    });
});
