import React from 'react';

function Modal({data}){
    console.log(data);
    if (!data) {
        return <></>;
    }

    const currentDate = new Date(); // 현재 날짜 가져오기
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`; // 년-월-일 형식으로 날짜 포맷하기
    return (
        <div className='flex flex-col items-center h-screen'>
            <div className='flex pt-20'>
                <img src='/app/그림2.png' className=' h-40'/>
            </div>
            <div className='flex text-5xl pb-10'>{formattedDate}</div>
            <div className='flex w-auto items-center justify-center'>
                <p className='flex text-white pt-1 pb-1 bg-orange-500 text-7xl font-black'>{data[0]}</p>
            </div>
            <div className='flex flex-col justify-center items-center h-96'>
                <div className=' grid-cols-2 grid w-full place-items-stretch'>
                    <div className='flex font-medium text-7xl p-10 justify-center'>내가 살때</div>
                    <div className='flex font-medium text-7xl p-10 justify-center'>내가 팔때</div>
                </div>
                <div className=' grid-cols-2 grid w-full justify-items-center'>
                    <div className='flex font-medium text-7xl p-10 justify-center pl-14'>{new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(data[1])}원</div>
                    <div className='flex font-medium text-7xl p-10 justify-center pl-14'>{new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(data[2])}원</div>
                </div>
            </div>
        </div>
    );
}

export default Modal;