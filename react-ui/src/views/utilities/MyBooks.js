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

const MyBooks = ({...others}) => {
    const account = useSelector((state) => state.account);
    const [expanded, setExpanded] = useState(false);
    const [contribution, setContribution] = useState()
    const [loaded, setLoaded] = useState(false)

    const [books, setBooks] = useState([]);

    const useBeforeRender = (callback, deps) => {
        const [isRun, setIsRun] = useState(false);
    
        if (!isRun) {
            callback();
            setIsRun(true);
        }
    
        useEffect(() => () => setIsRun(false), deps);
    };

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
      };

    const getContributions = async (data) => {
        const contributions = {}
        for(const book of data['books']) {
            let bookid = book['_id']
            await axios.get(configData.API_SERVER + 'get-book-contributions?book='+bookid, { headers: { Authorization: `${account.token}` } }).then(
                function(response){
                    contributions[bookid] = response['data']['contributions']
            
                }
            )
            
        }
        
        setContribution(contributions)
    }
    
    const getBooks = async () => {
        const { data } = await axios.get(configData.API_SERVER + 'get-user-books', { headers: { Authorization: `${account.token}` } })
        setBooks(data["books"]);
        await getContributions(data)
        
    };





    useBeforeRender(() => getBooks(), []);



  return(
      <div>
          {contribution && 
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
                        <Typography sx={{ color: 'text.secondary' }}> See Contributions</Typography>
                    </AccordionSummary>
                    {contribution[book['_id']].map((contr) => {
                    return(
                    <AccordionDetails> 
                                            <Button
                                                disableElevation
                                                disabled={false}
                                                fullWidth
                                                size="large"
                                                type="submit"
                                                variant="contained"
                                                color="secondary"
                                                href={"/review-contribution/"+contr['_id']}
                                            >
                                                Review
                                            </Button>
                    </AccordionDetails> )
                    })}

                    </Accordion>
                    
                )
            })} </div> }
        

                            <AnimateButton>
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
                                    New Book
                                </Button>
                            </AnimateButton>
      
      </div>

  )


}

export default MyBooks

