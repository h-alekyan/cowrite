import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import configData from '../../config';


// material-ui
import { makeStyles } from '@material-ui/styles';
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    TextField,
    Typography,
    useMediaQuery,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Card
} from '@material-ui/core';


// third party
import * as Yup from 'yup';
import { Formik } from 'formik';
import axios from 'axios';

// project imports
import useScriptRef from '../../hooks/useScriptRef';
import AnimateButton from '../../ui-component/extended/AnimateButton';
import { strengthColor, strengthIndicator } from '../../utils/password-strength';

import { useTheme } from '@material-ui/styles';


// assets
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';



//===========================|| MY BOOKS SECTION ||===========================//

const MyContributions = ({...others}) => {
    const account = useSelector((state) => state.account);
    const [expanded, setExpanded] = useState(false);

    const [books, setBooks] = useState(["hi"]);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
      };

    
    const getBooks = async () => {
        const { data } = await axios.get(configData.API_SERVER + 'get-user-contributions', { headers: { Authorization: `${account.token}` } });
        setBooks(data["books"]);
    };
    useEffect(() => {
    getBooks();
  }, []);

    const [content, setContent] = useState("")


  return(
      <div>
        {books.map((book) => {
        return (
            <Accordion expanded={expanded === book._id} onChange={handleChange(book['_id'])}>
                <AccordionSummary
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                    fullwidth
                    >
                <Typography sx={{ width: '33%', flexShrink: 0 }}>
                    {book['title']}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{book["status"]}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                                    <Button
                                        disableElevation
                                        disabled={false}
                                        fullWidth
                                        size="large"
                                        type="submit"
                                        variant="contained"
                                        color="secondary"
                                        href="/new-book"
                                    >
                                        Review
                                    </Button>
            </AccordionDetails>

            </Accordion>
            
        )
      })}

                        
      </div>

  )

}

export default MyContributions

