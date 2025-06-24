import React, { useState, useEffect } from 'react';

function Modal({data}){
    const [formattedDate, setFormattedDate] = useState('');
    
    useEffect(() => {
        const currentDate = new Date(); // 현재 날짜 가져오기
        const formatted = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`; // 년-월-일 형식으로 날짜 포맷하기
        setFormattedDate(formatted);
    }, []);

    console.log(data);
    if (!data) {
        return <></>;
    }

    return (
        <div className='flex flex-col items-center h-screen w-full px-2 sm:px-4 md:px-6 lg:px-8'>
            <div className='flex pt-4 sm:pt-6 md:pt-8 lg:pt-10'>
                <img src='/app/그림4.png' className='h-20 sm:h-24 md:h-32 lg:h-40 w-auto'/>
            </div>
            <div className='flex text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl pt-2 sm:pt-3 md:pt-4 pb-3 sm:pb-5 md:pb-7'>{formattedDate}</div>
            <div className='flex w-auto items-center justify-center'>
                <p className='flex text-white pb-1 bg-[#FF5500] text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-7xl font-black px-2 sm:px-3 md:px-4 lg:px-6'>{data[0]}</p>
            </div>
            <div className='flex flex-col justify-center items-center h-48 sm:h-64 md:h-80 lg:h-96 w-full'>
                <div className='grid grid-cols-2 w-full place-items-stretch gap-2 sm:gap-4 md:gap-6'>
                    <div>
                        <p className='flex font-medium text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-7xl pt-2 sm:pt-4 md:pt-6 lg:pt-8 px-2 sm:px-4 md:px-6 lg:px-10 pb-1 sm:pb-2 md:pb-3 justify-center text-center'>내가 살때</p>
                        <p className='flex font-medium text-xs sm:text-sm md:text-lg lg:text-2xl xl:text-3xl justify-center text-center'>(VAT포함)</p>
                    </div>
                    <div>
                        <p className='flex font-medium text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-7xl pt-2 sm:pt-4 md:pt-6 lg:pt-8 xl:pt-10 px-2 sm:px-4 md:px-6 lg:px-10 pb-1 sm:pb-2 md:pb-3 justify-center text-center'>내가 팔때</p>
                        <p className='flex font-medium text-xs sm:text-sm md:text-lg lg:text-2xl xl:text-3xl justify-center text-center'>(금방금방 기준)</p>
                    </div>
                </div>
                <div className='grid grid-cols-2 w-full justify-items-center gap-2 sm:gap-4 md:gap-6'>
                    <div className="w-full">
                        <div className={`flex font-medium p-2 sm:p-3 md:p-4 lg:p-6 justify-center text-center ${data[1]==0 ? "text-sm sm:text-lg md:text-2xl lg:text-3xl xl:text-5xl" : "text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-7xl"}`}>
                            {data[1]==0 ? "제품시세적용" : new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(data[1]) +"원"}
                        </div>
                        <div className={`flex font-medium justify-center text-center text-xs sm:text-sm md:text-lg lg:text-2xl xl:text-4xl ${data[5] == "+" ? 'text-red-600' : data[5] == "-" ? 'text-blue-600' : 'text-gray-600'}`}> 
                            ({data[5] == "+" ? "▲" : data[5] == '-' ? "▼" : ""}{new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(data[3])})
                        </div>
                    </div>
                    <div className="w-full">
                        <div className={`flex font-medium p-2 sm:p-3 md:p-4 lg:p-6 justify-center text-center ${data[2]==0 ? "text-sm sm:text-lg md:text-2xl lg:text-3xl xl:text-5xl" : "text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-7xl"}`}>
                            {data[2]==0 ? "제품시세적용" : new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(data[2]) +"원"}
                        </div>
                        <div className={`flex font-medium justify-center text-center text-xs sm:text-sm md:text-lg lg:text-2xl xl:text-4xl ${data[6] == "+" ? 'text-red-600' : data[6] == "-" ? 'text-blue-600' : 'text-gray-600'}`}> 
                            ({data[6] == "+" ? "▲" : data[6] == '-' ? "▼" :  ""}{new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(data[4])})
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;