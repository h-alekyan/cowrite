import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@material-ui/styles';
import {
    Drawer,
    Fab,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    Radio,
    RadioGroup,
    Slider,
    Tooltip,
    Typography
} from '@material-ui/core';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';

// project imports
import SubCard from '../../ui-component/cards/SubCard';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import { SET_BORDER_RADIUS, SET_FONT_FAMILY } from '../../store/actions'; // THEME_RTL
import { gridSpacing } from '../../store/constant';

// assets
import { IconSettings } from '@tabler/icons';

// concat 'px'
function valueText(value) {
    return `${value}px`;
}

//-----------------------|| LIVE CUSTOMIZATION ||-----------------------//

const Customization = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const customization = useSelector((state) => state.customization);

    // drawer on/off
    const [open, setOpen] = React.useState(false);
    const handleToggle = () => {
        setOpen(!open);
    };

    // state - border radius
    const [borderRadius, setBorderRadius] = React.useState(customization.borderRadius);
    const handleBorderRadius = (event, newValue) => {
        setBorderRadius(newValue);
    };

    useEffect(() => {
        dispatch({ type: SET_BORDER_RADIUS, borderRadius: borderRadius });
    }, [dispatch, borderRadius]);

    let initialFont;
    switch (customization.fontFamily) {
        case `'Inter', sans-serif`:
            initialFont = 'Inter';
            break;
        case `'Poppins', sans-serif`:
            initialFont = 'Poppins';
            break;
        case `'Roboto', sans-serif`:
        default:
            initialFont = 'Roboto';
            break;
    }

    // state - font family
    const [fontFamily, setFontFamily] = React.useState(initialFont);
    useEffect(() => {
        let newFont;
        switch (fontFamily) {
            case 'Inter':
                newFont = `'Inter', sans-serif`;
                break;
            case 'Poppins':
                newFont = `'Poppins', sans-serif`;
                break;
            case 'Roboto':
            default:
                newFont = `'Roboto', sans-serif`;
                break;
        }
        dispatch({ type: SET_FONT_FAMILY, fontFamily: newFont });
    }, [dispatch, fontFamily]);

    return (
        <React.Fragment>
            {/* toggle button */}

            
        </React.Fragment>
    );
};

export default Customization;
