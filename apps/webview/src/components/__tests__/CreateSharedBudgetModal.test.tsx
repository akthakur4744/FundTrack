import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateSharedBudgetModal } from '../CreateSharedBudgetModal';
import * as firebase from '@fundtrack/firebase';

// Mock the Firebase hook
jest.mock('@fundtrack/firebase', () => ({
  useCreateSharedBudget: jest.fn(),
}));

describe('CreateSharedBudgetModal', () => {
  const mockMutate = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (firebase.useCreateSharedBudget as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('renders modal when isOpen is true', () => {
    render(
      <CreateSharedBudgetModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Create Shared Budget')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Budget name...')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    const { container } = render(
      <CreateSharedBudgetModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('closes modal when close button is clicked', async () => {
    render(
      <CreateSharedBudgetModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('validates required fields on submit', async () => {
    render(
      <CreateSharedBudgetModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByText('✓ Create Budget');
    fireEvent.click(submitButton);

    // Check for error messages
    await waitFor(() => {
      expect(screen.getByText('Budget name is required')).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('requires email for invitations', async () => {
    const user = userEvent.setup();

    render(
      <CreateSharedBudgetModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill in required fields
    const nameInput = screen.getByPlaceholderText('Budget name...');
    await user.type(nameInput, 'Trip to Europe');

    // Try to add invalid email
    const emailInput = screen.getByPlaceholderText('Enter email...');
    await user.type(emailInput, 'invalid-email');

    const addEmailButton = screen.getByText('➕ Add Email');
    fireEvent.click(addEmailButton);

    // Error should appear
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('prevents duplicate email invitations', async () => {
    const user = userEvent.setup();

    render(
      <CreateSharedBudgetModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const emailInput = screen.getByPlaceholderText('Enter email...');
    const addEmailButton = screen.getByText('➕ Add Email');

    // Add first email
    await user.type(emailInput, 'friend@example.com');
    fireEvent.click(addEmailButton);

    await waitFor(() => {
      expect(screen.getByText('friend@example.com')).toBeInTheDocument();
    });

    // Try to add same email again
    await user.clear(emailInput);
    await user.type(emailInput, 'friend@example.com');
    fireEvent.click(addEmailButton);

    // Duplicate error should appear
    await waitFor(() => {
      expect(screen.getByText('Email already invited')).toBeInTheDocument();
    });
  });

  it('removes email from invitation list', async () => {
    const user = userEvent.setup();

    render(
      <CreateSharedBudgetModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const emailInput = screen.getByPlaceholderText('Enter email...');
    const addEmailButton = screen.getByText('➕ Add Email');

    // Add email
    await user.type(emailInput, 'friend@example.com');
    fireEvent.click(addEmailButton);

    await waitFor(() => {
      expect(screen.getByText('friend@example.com')).toBeInTheDocument();
    });

    // Remove email
    const removeButton = screen.getByText('✕');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('friend@example.com')).not.toBeInTheDocument();
    });
  });

  it('validates amount is positive', async () => {
    const user = userEvent.setup();

    render(
      <CreateSharedBudgetModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByPlaceholderText('Budget name...');
    await user.type(nameInput, 'Trip');

    const amountInput = screen.getByPlaceholderText('0.00');
    await user.type(amountInput, '-100');

    const submitButton = screen.getByText('✓ Create Budget');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    });
  });

  it('validates custom period end date is after start date', async () => {
    const user = userEvent.setup();

    render(
      <CreateSharedBudgetModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByPlaceholderText('Budget name...');
    await user.type(nameInput, 'Trip');

    const amountInput = screen.getByPlaceholderText('0.00');
    await user.type(amountInput, '1000');

    // Select custom period
    const customButton = screen.getByText('Custom');
    fireEvent.click(customButton);

    // Set end date before start date
    const startDateInput = screen.getAllByDisplayValue('')[0]; // First date input
    const endDateInput = screen.getAllByDisplayValue('')[1]; // Second date input

    await user.type(startDateInput, '2025-12-31');
    await user.type(endDateInput, '2025-12-01');

    const submitButton = screen.getByText('✓ Create Budget');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();

    (firebase.useCreateSharedBudget as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(
      <CreateSharedBudgetModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill form
    const nameInput = screen.getByPlaceholderText('Budget name...');
    await user.type(nameInput, 'Trip to Europe');

    const amountInput = screen.getByPlaceholderText('0.00');
    await user.type(amountInput, '5000');

    // Add email
    const emailInput = screen.getByPlaceholderText('Enter email...');
    await user.type(emailInput, 'friend@example.com');
    const addEmailButton = screen.getByText('➕ Add Email');
    fireEvent.click(addEmailButton);

    // Submit
    const submitButton = screen.getByText('✓ Create Budget');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    const callArgs = mockMutate.mock.calls[0][0];
    expect(callArgs.name).toBe('Trip to Europe');
    expect(callArgs.totalBudget).toBe(5000);
    expect(callArgs.memberEmails).toContain('friend@example.com');
  });
});
