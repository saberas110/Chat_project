

export default function NotExistsError ({showError}){


    const handleCancel = ()=>{

        showError(false)

    }




    return(

        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-80 max-w-sm mx-4">
                {/* هدر مودال */}
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-center">New Contact</h3>
                </div>

                <h1 className='text-right m-5 font-bold'>کاربری با این شماره وجود ندارد</h1>


                {/* دکمه‌های پایین */}
                <div className="p-4 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={handleCancel}
                        className="flex-1 py-2.5 text-gray-600 hover:bg-gray-100 rounded font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCancel}

                        className="flex-1 py-2.5 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Ok
                    </button>
                </div>
            </div>
        </div>

    )
}