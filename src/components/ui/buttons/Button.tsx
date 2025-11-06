import { ButtonProps } from '@mui/base/Button';
import { useButton } from '@mui/base/useButton';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/system';
import clsx from 'clsx';
import * as React from 'react';

const CustomButton = React.forwardRef(function CustomButton(
    props: ButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
) {
 
    const { children, disabled } = props;
    const { active, focusVisible, getRootProps } = useButton({
        ...props,
        rootRef: ref,
    });

    return (
        <CustomButtonRoot
            {...getRootProps()}
            className={clsx({
                active,
                disabled,
                focusVisible,
            })}

        >
            {children}
        </CustomButtonRoot>
    );
});

interface BtnProps {
    text: string;
    type?: "submit";
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
}

export const UseButton = ({ text, type, onClick, disabled, loading }: BtnProps) => {
    return (
        <Stack spacing={2} direction="row">
            <CustomButton onClick={onClick} data-testid="button-display" type={type} disabled={disabled || loading}>
                {loading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={16} sx={{ color: 'white' }} />
                        <span>{text}</span>
                    </Stack>
                ) : (
                    text
                )}
            </CustomButton>
        </Stack>
    );
}
export default UseButton;

const blue = {
    200: '#000',
    300: '#000',
    400: '#000',
    500: '#000',
    600: '#000',
    700: '#000',
};

const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
};

const CustomButtonRoot = styled('button')(
    ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
  background-color: ${blue[500]};
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
  transition: all 150ms ease;
  cursor: pointer;
  border: 1px solid ${blue[500]};
  box-shadow: 0 2px 1px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(45, 45, 60, 0.2)'
        }, inset 0 1.5px 1px ${blue[400]}, inset 0 -2px 1px ${blue[600]};

  &:hover {
    background-color: ${blue[600]};
  }

  &.active {
    background-color: ${blue[700]};
    box-shadow: none;
    transform: scale(0.99);
  }

  &.focusVisible {
    box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]};
    outline: none;
  }

  &.disabled {
    background-color: ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    color: ${theme.palette.mode === 'dark' ? grey[200] : grey[700]};
    border: 0;
    cursor: default;
    box-shadow: none;
    transform: scale(1);
  }
`,
);