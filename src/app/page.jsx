"use client";

import Slider from "react-slick";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Modal from "./Modal";


export default function Home() {
  const [gold, setGold] = useState([]);
  const [gold18k, setGold18k] = useState([]);
  const [gold14k, setGold14k] = useState([]);
  const [whitegold, setWhitegold] = useState([]);
  const [silver, setSilver] = useState([]);


  const fetchData = async () => {
    const response = await axios.get('https://prod-image.koreagoldx.co.kr/price.json?{%22srchDt%22%20:%20%22TODAY%22,%22type%22%20:%20%22Au%22}');
    setGold(["순금시세", response.data.lineUpVal[0].spure, response.data.lineUpVal[0].ppure]);
    setGold18k(["18K 금시세", response.data.lineUpVal[0].s18k, response.data.lineUpVal[0].p18k]);
    setGold14k(["14K 금시세", response.data.lineUpVal[0].s14k, response.data.lineUpVal[0].p14k]);
    setWhitegold(["백금시세", response.data.lineUpVal[0].swhite, response.data.lineUpVal[0].pwhite]);
    setSilver(["은시세", response.data.lineUpVal[0].ssilver, response.data.lineUpVal[0].psilver]);
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 60000); // 1분마다 fetchData 함수를 실행합니다.

    return () => clearInterval(intervalId); // 컴포넌트가 언마운트될 때 인터벌을 정리합니다.
  }, []);

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (current, next) => {
      console.log(`Slide changed from: ${current} to ${next} at: ${new Date().getTime()}`);
    }
  }
  return (
    <>
      <Slider {...settings} className="flex h-screen">
          <Modal data={gold} />
          <Modal data={gold18k} />
          <Modal data={gold14k} />
          <Modal data={whitegold} />
          <Modal data={silver} />
      </Slider>
    </>
  )
}
