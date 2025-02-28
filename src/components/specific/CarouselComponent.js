import React from 'react';
import { Carousel } from 'nuka-carousel';
import { Box, Button } from '@mui/material';
import Room from '../../assets/images/Room.jpg';
import Room2 from '../../assets/images/Room2.jpg';
import Room3 from '../../assets/images/Room3.jpg';
import House from '../../assets/images/House.jpg';
import Apartments from '../../assets/images/Apartments.jpg';

const CarouselComponent = () => {
  const images = [Room, Apartments, Room2, House, Room, Room3];

  return (
    <Carousel
      autoplay
      autoplayInterval={2000}
      wrapAround
      defaultControlsConfig={{
        pagingDotsStyle: { fill: '#c0392b' },
      }}
      showArrows
    >
      {images.map((src, index) => (
        <Box
          key={index}
          component="img"
          src={src}
          alt={`Slide ${index + 1}`}
          sx={{
            width: '100%',
            height: '530px',
            borderRadius: 2,
            objectFit: 'cover',
            marginRight: "10px",
            marginLeft: "10px"
          }}
        />
      ))}
    </Carousel>
  );
};

export default CarouselComponent;
