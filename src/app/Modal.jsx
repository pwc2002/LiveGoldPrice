import React from 'react';

function Modal({data}){
    console.log(data);
    if (!data) {
        return <></>;
    }
    return (
        <div className='flex flex-col items-center h-screen'>
            <div className='flex w-full h-64 items-center justify-center font-black text-7xl'>
                {data[0]}
            </div>
            <div className='flex flex-col justify-center items-center h-96'>
                <div className=' grid-cols-2 grid w-full place-items-stretch'>
                    <div className='flex font-medium text-7xl p-10 justify-center'>내가 살때</div>
                    <div className='flex font-medium text-7xl p-10 justify-center'>내가 팔때</div>
                </div>
                <div className=' grid-cols-2 grid w-full justify-items-center'>
                    <div className='flex font-medium text-7xl p-10 justify-center'>{new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(data[1])}원</div>
                    <div className='flex font-medium text-7xl p-10 justify-center'>{new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(data[2])}원</div>
                </div>
            </div>
        </div>
    );
}

export default Modal;