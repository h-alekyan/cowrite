import React from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

import configData from '../../../../config';
import axios from 'axios';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// material-ui
import { useTheme, Card, CardActions, CardContent, CardMedia, Button, Typography} from '@material-ui/core';



//===============================|| AUTH3 - REGISTER ||===============================//

const Bookpage= () => {

    let { id } = useParams();

    const [book, setBook] = useState();

    const account = useSelector((state) => state.account);
    
    const getBook = async () => {
        const { data } = await axios.get(configData.API_SERVER + 'get-book?book=' + id);
        console.log(book)
        setBook(data['book']);
        };
    
    useEffect(() => {
        getBook();
    }, []);


    const renderActions = () => {
        if(account.isLoggedIn && book){
            if(account.user._id == book['author']){
                return(
                    <div>
                        <Button size="small" href={'/edit-book/'+id}>Edit</Button>
                        <Button size="small">View</Button>
                    </div>
                )
            } else {
                console.log(account)
                return(
                    <div>
                        <Button size="small" href={'/new-contribution/' +id}>Contribute</Button>
                        <Button size="small">View</Button>
                    </div>
                ) 
            }
        } else {
            return(
                <div>
                    <Button size="small" href={'/new-contribution/' +id}>Contribute</Button>
                    <Button size="small">View</Button>
                </div>
            ) 
        }
    }




    return (
        <Card sx={{ maxWidth: 600 }}>
        <CardMedia
          component="img"
          height="240"
          image="https://i.ibb.co/qdGVYTF/david-clode-vb-3q-Ee3rg8-unsplash.jpg"
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {book && book["title"]}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {book && book["description"]}
          </Typography>
        </CardContent>
        <CardActions>
          {renderActions()}
        </CardActions>
      </Card>
    );
};

export default Bookpage;
