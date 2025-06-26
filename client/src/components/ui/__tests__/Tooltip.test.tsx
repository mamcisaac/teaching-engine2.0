import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip, InfoTooltip } from '../Tooltip';

describe('Tooltip', () => {
  it('renders children and shows tooltip on hover', () => {
    render(
      <Tooltip content="Test tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    expect(button).toBeInTheDocument();

    // Tooltip should not be visible initially
    expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();

    // Hover over the button
    fireEvent.mouseEnter(button);
    expect(screen.getByText('Test tooltip content')).toBeInTheDocument();

    // Leave hover
    fireEvent.mouseLeave(button);
    expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
  });

  it('renders default help icon when no children provided', () => {
    const { container } = render(<Tooltip content="Help text" />);
    
    // Check for the HelpCircle icon by its class
    const helpIcon = container.querySelector('.h-4.w-4.text-gray-400');
    expect(helpIcon).toBeInTheDocument();
  });
});

describe('InfoTooltip', () => {
  it('renders help icon with tooltip', () => {
    const { container } = render(<InfoTooltip content="Information tooltip" />);
    
    // Check for the HelpCircle icon by its class
    const helpIcon = container.querySelector('.h-4.w-4.text-gray-400');
    expect(helpIcon).toBeInTheDocument();

    // Hover to show tooltip
    fireEvent.mouseEnter(helpIcon!);
    expect(screen.getByText('Information tooltip')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <InfoTooltip content="Test" className="custom-class" />
    );
    
    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });
});