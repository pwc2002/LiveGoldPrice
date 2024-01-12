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
            <div className='flex text-5xl pb-11'>{formattedDate}</div>
            <div className='flex w-auto items-center justify-center'>
                <p className='flex text-white pt-1 pb-1 bg-orange-500 text-7xl font-black'>{data[0]}</p>
            </div>
            <div className='flex flex-col justify-center items-center h-96'>
                <div className=' grid-cols-2 grid w-full place-items-stretch'>
                    <div>
                        <p className='flex font-medium text-7xl pt-10 pl-10 pr-10 pb-3 justify-center'>내가 살때</p>
                        <p className='flex font-medium text-3xl justify-center'>(VAT포함)</p>
                    </div>
                    <div>
                        <p className='flex font-medium text-7xl pt-10 pl-10 pr-10 pb-3 justify-center'>내가 팔때</p>
                        <p className='flex font-medium text-3xl justify-center'>(금방금방 기준)</p>
                    </div>
                </div>
                <div className=' grid-cols-2 grid w-full justify-items-center'>
                    <div>
                        <div className='flex font-medium text-7xl p-10 justify-center pl-14'>{data[1]==0 ? "제품시세적용" : new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(data[1]) +"원"}</div>
                        <div className={`flex font-medium justify-center text-4xl ${data[5] == "+" ? 'text-red-600' : data[5] == "-" ? 'text-blue-600' : 'text-gray-600'}`}> ({data[5] == "+" ? "▲" : data[5] == '-' ? "▼" : ""}{new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(data[3])})</div>
                    </div>
                    <div>
                        <div className='flex font-medium text-7xl p-10 justify-center pl-14'>{data[2]==0 ? "제품시세적용" : new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(data[2]) +"원"}</div>
                        <div className={`flex font-medium justify-center text-4xl ${data[6] == "+" ? 'text-red-600' : data[6] == "-" ? 'text-blue-600' : 'text-gray-600'}`}> ({data[6] == "+" ? "▲" : data[6] == '-' ? "▼" :  ""}{new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(data[4])})</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;