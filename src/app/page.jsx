"use client";

import Slider from "react-slick";
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Modal from "./Modal";
import ReactPlayer from "react-player";


export default function Home() {
  const [gold, setGold] = useState([]);
  const [gold18k, setGold18k] = useState([]);
  const [gold14k, setGold14k] = useState([]);
  const [whitegold, setWhitegold] = useState([]);
  const [silver, setSilver] = useState([]);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef(null);


  const fetchData = async () => {
    const response = await axios.get('https://prod-image.koreagoldx.co.kr/price.json?{%22srchDt%22%20:%20%22TODAY%22,%22type%22%20:%20%22Au%22}');
    setGold(["순금(24K) 시세", response.data.lineUpVal[0].spure, response.data.lineUpVal[0].ppure, response.data.lineUpVal[0].turmPure, response.data.lineUpVal[0].pturmPure, response.data.lineUpVal[0].updownPure,response.data.lineUpVal[0].pupdownPure]);
    setGold18k(["18K 금시세", 0, response.data.lineUpVal[0].p18k, response.data.lineUpVal[0].turm18k, response.data.lineUpVal[0].pturm18k, response.data.lineUpVal[0].updown18k, response.data.lineUpVal[0].pupdown18k]);
    setGold14k(["14K 금시세", 0, response.data.lineUpVal[0].p14k, response.data.lineUpVal[0].turm14k, response.data.lineUpVal[0].pturm14k, response.data.lineUpVal[0].updown14k, response.data.lineUpVal[0].pupdown14k]);
    setWhitegold(["백금시세", response.data.lineUpVal[0].swhite, response.data.lineUpVal[0].pwhite, response.data.lineUpVal[0].turmWhite, response.data.lineUpVal[0].pturmWhite, response.data.lineUpVal[0].updownWhite, response.data.lineUpVal[0].pupdownWhite]);
    setSilver(["은시세", response.data.lineUpVal[0].ssilver, response.data.lineUpVal[0].psilver, response.data.lineUpVal[0].turmSilver, response.data.lineUpVal[0].pturmSilver, response.data.lineUpVal[0].updownSilver, response.data.lineUpVal[0].pupdownSilver]);
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 60000); // 1분마다 fetchData 함수를 실행합니다.

    return () => {
      clearInterval(intervalId)}; // 컴포넌트가 언마운트될 때 인터벌을 정리합니다.
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

  const onPlayVideo = () => {
    setPlaying(true);
  };
  return (
    <>
      <div className="relative">
        <Slider {...settings} className="flex h-screen">
            <Modal data={gold} />
            <Modal data={gold18k} />
            <Modal data={gold14k} />
            <Modal data={whitegold} />
            <Modal data={silver} />
        </Slider>
      </div>
      <button onClick={onPlayVideo} className="flex text-6xl bg-slate-600 w-full">Play</button>
      {playing ? 'Playing' : 'Not playing'}
      <ReactPlayer
        ref={playerRef}
        url='https://www.youtube.com/watch?v=O3oWeOsgGpA'
        playing={playing}
        controls={true}
        width="10%"
        height="10%"
      />
      </>
  )
}
