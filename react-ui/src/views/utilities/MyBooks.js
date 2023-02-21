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
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Alert,
    Snackbar,
    Portal
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
    const CLIENT_ID = 'e274cb8b4acf0c94f05b'

    const [open, setOpen] = React.useState(false);
    const [snackPack, setSnackPack] = React.useState([]);
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [messageInfo, setMessageInfo] = React.useState(undefined);


    const [githubAuth, setGitHubAuth] = useState()
    const [githubRepos, setGithubRepos] = useState()

    const account = useSelector((state) => state.account);
    const [expanded, setExpanded] = useState(false);
    const [contribution, setContribution] = useState()
    const [loaded, setLoaded] = useState(false)

    const [books, setBooks] = useState([]);

    const [success, setSuccess] = useState(false)



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

    const handleOpen  = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        window.location.reload(true)
      };

    const handleSnackClick = (message) => () => {
        setSnackPack((prev) => [...prev, { message, key: new Date().getTime() }]);
    };

    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setSnackOpen(false);
      };

    const handleExited = () => {
        setMessageInfo(undefined);
    };


    const loginWithGitHub = () => {
        window.location.assign('https://github.com/login/oauth/authorize?client_id=' + CLIENT_ID)
    }


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


    const getGithubAuth = async () => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const auth = urlParams.get('code')

        console.log(auth)
        

        if (auth && (localStorage.getItem("GitHubAccessToken") === null)){
            const access_token = await axios.get(configData.API_SERVER + 'get-github-accesstoken?code='+auth, { headers: { Authorization: `${account.token}` } })
            setGitHubAuth(access_token['data']['response']['access_token']) 
        }

    }


    const getGithubRepos = async () => {
        console.log("exists")
        if (githubAuth !== undefined){
            console.log(githubAuth)
            const auth = 'BEARER ' + githubAuth
            const repos = await axios.get(configData.API_SERVER + 'get-github-user?auth='+auth, { headers: { Authorization: `${account.token}` } })
            setGithubRepos(repos)
            handleOpen()
        }
    }

    useBeforeRender(() => getBooks(), []);
    useBeforeRender(() => getGithubAuth(), []);

    useEffect(() => {
        getGithubRepos()
    }, [githubAuth])

    const descriptionElementRef = React.useRef(null);
    useEffect(() => {
    if (open) {
        const { current: descriptionElement } = descriptionElementRef;
        if (descriptionElement !== null) {
            descriptionElement.focus();
        }
    }
    }, [open]);

    useEffect(() => {
        if (snackPack.length && !messageInfo) {
          // Set a new snack when we don't have an active one
          setMessageInfo({ ...snackPack[0] });
          setSnackPack((prev) => prev.slice(1));
          setSnackOpen(true);
        } else if (snackPack.length && messageInfo && open) {
          // Close an active snack when a new one is added
          setSnackOpen(false);
        }
      }, [snackPack, messageInfo, snackOpen]);

    

    console.log(githubAuth)

  return(
      <div>

          <div style={{display:'flex', justifyContent: 'space-between', marginBottom: '1em'}}>
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
                            <AnimateButton>
                                <Button
                                    disableElevation
                                    disabled={false}
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    onClick={loginWithGitHub}
                                >
                                    Connect GitHub
                                </Button>
                            </AnimateButton>
                            </div>
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
                    console.log(contr) 
                    if(contr['status'] == 'submitted'){
                    return(
                    <AccordionDetails> 
                        <div>
                            <p>Contribution by {contr['contributor_username']}</p>
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
                            </div>
                    </AccordionDetails> )
                    }})}

                    </Accordion>
                    
                )
            })} 
        </div> 
        }
        {(githubRepos && githubAuth) && 
          <div>
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        scroll='paper'
                        aria-labelledby="scroll-dialog-title"
                        aria-describedby="scroll-dialog-description"
                    >
                        <DialogTitle id="scroll-dialog-title">Would you like to import any projects?</DialogTitle>
                        <DialogContent dividers={true}>
                        <DialogContentText
                            id="scroll-dialog-description"
                            ref={descriptionElementRef}
                            tabIndex={-1}
                        >
                          {githubRepos['data']['response'].map((repo) => {
                return (
                        <Accordion expanded={expanded === repo['id']} onChange={handleChange(repo['id'])}>
                        <AccordionSummary
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                            fullwidth
                            >
                        <Typography sx={{ width: '100%', flexShrink: 0 }}>
                            <div style={{display:'flex', justifyContent: 'space-between', marginBottom: '1em'}}>
                                <div style={{width: '50%'}}>
                                    {repo['name']}
                                </div>
                                <Button
                                    disableElevation
                                    disabled={false}
                                    size="small"
                                    type="submit"
                                    variant="contained"
                                    color="secondary"
                                    onClick={async function(){
                                        await axios.post(configData.API_SERVER + 'fetch-github-content', {gitAuth: githubAuth, repo: repo['name'], user: repo['owner']['login']}, { headers: { Authorization: `${account.token}` }}).then(response => {
                                           <Portal>
                                                <Dialog
                                                    open={true}
                                                    onClose={handleClose}
                                                    scroll='paper'
                                                    aria-labelledby="scroll-dialog-title"
                                                    aria-describedby="scroll-dialog-description"
                                                >
                                                <DialogContentText
                                                    id="scroll-dialog-description"
                                                    tabIndex={-1}
                                                >
                                                    Success

                                                </DialogContentText>
                                                </Dialog>
                                            </Portal>
                                        })
                                        

                                    }}
                                >
                                                Fetch
                                            </Button>
                            </div>
                        </Typography>
                        {/* <Typography sx={{ color: 'text.secondary' }}> Import </Typography> */}
                    </AccordionSummary>

                    </Accordion>
                )})}
                        </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={handleClose}>Done</Button>
                        </DialogActions>
                    </Dialog>
                    
             
        </div> 
        }

                            
      
      </div>

  )


}

export default MyBooks

