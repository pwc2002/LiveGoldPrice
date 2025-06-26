"use client";

import Slider from "react-slick";
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Modal from "./Modal";
import YouTube from "react-youtube";

export default function Home() {
  const [gold, setGold] = useState([]);
  const [gold18k, setGold18k] = useState([]);
  const [gold14k, setGold14k] = useState([]);
  const [whitegold, setWhitegold] = useState([]);
  const [silver, setSilver] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [player, setPlayer] = useState(null);

  const fetchData = async () => {
    const response = await axios.get('https://prod-image.koreagoldx.co.kr/price.json?{%22srchDt%22%20:%20%22TODAY%22,%22type%22%20:%20%22Au%22}');
    setGold(["순금(24K) 시세", response.data.lineUpVal[0].spure, response.data.lineUpVal[0].ppure, response.data.lineUpVal[0].turmPure, response.data.lineUpVal[0].pturmPure, response.data.lineUpVal[0].updownPure,response.data.lineUpVal[0].pupdownPure]);
    setGold18k(["18K 금시세", 0, response.data.lineUpVal[0].p18k, response.data.lineUpVal[0].turm18k, response.data.lineUpVal[0].pturm18k, response.data.lineUpVal[0].updown18k, response.data.lineUpVal[0].pupdown18k]);
    setGold14k(["14K 금시세", 0, response.data.lineUpVal[0].p14k, response.data.lineUpVal[0].turm14k, response.data.lineUpVal[0].pturm14k, response.data.lineUpVal[0].updown14k, response.data.lineUpVal[0].pupdown14k]);
    setWhitegold(["백금시세", response.data.lineUpVal[0].swhite, response.data.lineUpVal[0].pwhite, response.data.lineUpVal[0].turmWhite, response.data.lineUpVal[0].pturmWhite, response.data.lineUpVal[0].updownWhite, response.data.lineUpVal[0].pupdownWhite]);
    setSilver(["은시세", response.data.lineUpVal[0].ssilver, response.data.lineUpVal[0].psilver, response.data.lineUpVal[0].turmSilver, response.data.lineUpVal[0].pturmSilver, response.data.lineUpVal[0].updownSilver, response.data.lineUpVal[0].pupdownSilver]);
  };

  useEffect(() => {
    setMounted(true);
    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    return () => {
      clearInterval(intervalId)};
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
    if (player) {
      player.playVideo();
      setPlaying(true);
    }
  };

  const onReady = (event) => {
    setPlayer(event.target);
  };

  const onStateChange = (event) => {
    if (event.data === 1) {
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      fs: 1,
      cc_load_policy: 0,
      start: 6,
      list: 'PLVefncH6MagHe1l-uPB5jWUeDQokGUlyG',
      listType: 'playlist'
    },
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg sm:text-xl md:text-2xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full">
        <Slider {...settings} className="flex h-screen w-full">
            <Modal data={gold} />
            <Modal data={gold18k} />
            <Modal data={gold14k} />
            <Modal data={whitegold} />
            <Modal data={silver} />
        </Slider>
      </div>
      <button 
        onClick={onPlayVideo} 
        className="flex text-lg sm:text-2xl md:text-4xl lg:text-6xl bg-slate-600 w-full justify-center items-center py-2 sm:py-3 md:py-4 hover:bg-slate-700 transition-colors"
      >
        Play
      </button>
      <div className="text-center text-sm sm:text-base md:text-lg py-1">
        {playing ? 'Playing' : 'Not playing'}
      </div>
      <div className="flex justify-center items-center w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-[90vh]">
        <YouTube
          videoId="tHjCo2WDByI"
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          className="w-full h-full"
        />
      </div>
    </>
  )
}
