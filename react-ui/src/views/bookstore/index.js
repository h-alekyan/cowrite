import PropTypes from 'prop-types';
import React from 'react';
import {useState, useEffect} from 'react'
import axios from 'axios';

// material-ui
import { useTheme } from '@material-ui/styles';
import { Box, Card, Grid, ListItemSecondaryAction, Typography, CardActions, Button, CardActionArea, CardContent, CardMedia} from '@material-ui/core';


// project imports
import SubCard from './../../ui-component/cards/SubCard';
import MainCard from './../../ui-component/cards/MainCard';
import SecondaryAction from './../../ui-component/cards/CardSecondaryAction';
import { gridSpacing } from './../../store/constant';
import configData from '../../config';
//===============================|| COLOR BOX ||===============================//



//===============================|| UI COLOR ||===============================//

const Bookstore = () => {
    const theme = useTheme();

    const [books, setBooks] = useState([]);
    
    const getBooks = async () => {
        const { data } = await axios.get(configData.API_SERVER + 'get-all-books');
        setBooks(data["books"]);
        };
    
    useEffect(() => {
        getBooks();
    }, []);



    return (
        <MainCard title="Welcome to Cowrite">
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                        <Grid container spacing={gridSpacing}>
                            {books.map((book) => {
                                return(
                                    <Grid item xs={12} sm={6} md={4} lg={2}>
                                    <Card sx={{ maxWidth: 345 }}>
                                    <CardActionArea>
                                      <CardMedia
                                        component="img"
                                        height="140"
                                        image="https://i.ibb.co/qdGVYTF/david-clode-vb-3q-Ee3rg8-unsplash.jpg"
                                        alt="green iguana"
                                      />
                                      <CardContent>
                                        <Typography gutterBottom variant="h5" component="div">
                                          {book['title']}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          Lizards are a widespread group of squamate reptiles, with over 6,000
                                          species, ranging across all continents except Antarctica
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                    <CardActions>
                                      <Button size="small" color="primary" href={"/book/"+book['_id']}>
                                        View
                                      </Button>
                                    </CardActions>
                                  </Card>
                                  </Grid>
                                
                                )
                            })}
                         
                        </Grid>
               
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default Bookstore;


