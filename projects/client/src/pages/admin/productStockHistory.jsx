import { useEffect, useState } from "react";
import { api } from "../../api/api";
import PaginationFixed from "../../components/paginationComponent";
import { useAppSelector } from '../../redux/App/Store';
import toast, { Toaster } from "react-hot-toast";
import NavbarAdmin from "../../components/navbarAdmin";
import Footer from "../../components/footer";
import { BiSearchAlt } from "react-icons/bi";


const ProductStockHistoryPage = () => {
    const [stockData, setStockData] = useState("");
    const [nameQuery, setNameQuery] = useState("");
    const [descQuery, setDescQuery] = useState("");
    const [branchQuery, setBranchQuery] = useState("");
    const userSelector = useAppSelector((state) => state.users);
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const handleNameQuery = (event) => {
        setNameQuery(event.target.value);
    };
    const handleDescQuery = (event) => {
        setDescQuery(event.target.value);
    };
    const handleBranchQuery = (event) => {
        setBranchQuery(event.target.value);
    };
    const fetchData = async () => {
        const response = await api().get(`/stock/history?product=${nameQuery}&branch=${branchQuery}&description=${descQuery}&page=${page}`)
        setMaxPage(response.data.data.maxPages);
        setStockData(response.data.data.productStockHistory);
        console.log(response.data.data.productStockHistory);
    }
    const handlePageChange = async (newPage) => {
        if (newPage >= 1 && newPage <= maxPage) {
            setPage(newPage);
            await fetchData()
        } else {
            toast.error("Invalid page number!");
        }
    };
    const handleNextPage = () => {
        handlePageChange(page + 1);
    };
    const handlePrevPage = () => {
        handlePageChange(page - 1);
    };
    useEffect(() => {
        fetchData()
    }, [nameQuery, descQuery, branchQuery, page])
    return (
        <div className="">
            <NavbarAdmin />
            <Toaster />

            <div className="mt-[70px] mx-5 pt-5 md:mx-20 lg:mx-32">

                <div className="">

                    <div className="">
                        <div className="text-4xl font-bold text-green-800 mb-3">
                            Stock History                        </div>
                    </div>

                    <div className="border shadow-lg rounded-2xl overflow-x-auto lg:justify-center mt-5 p-3 border-l-4 border-r-4 border-l-yellow-300 border-r-green-600 mb-5 flex">
                        <div className="border-2 flex rounded-xl bg-white h-[48px]">
                            <div className="flex items-center pl-2 text-green-800"><BiSearchAlt /></div>
                            <input value={nameQuery} onChange={handleNameQuery} type="text" className="lg:grid lg:place-content-center outline-none rounded-full w-[300px] text-lg pl-2" placeholder="Search Product Name" />
                        </div>
                        <div className=''>
                            <select name="" id="" className='w-[130px] h-[48px] px-2 border-2 rounded-xl lg:w-[220px]' onChange={handleDescQuery} value={descQuery}>
                                <option value=""> show all </option>
                                <option value="sale"> Sale </option>
                                <option value="stock"> Restock </option>
                                <option value="expire"> Expire Product </option>
                            </select>
                        </div>

                        <div>
                            {/* data belum di map */}
                            {
                                userSelector.role == "superadmin" ?
                                    <select name="" id="" className="w-[130px] h-[48px] px-2 border-2 rounded-xl lg:w-[220px]" onChange={handleBranchQuery} value={branchQuery}>
                                        <option value=""> filter by store </option>
                                        <option value="1"> Graha Raya </option>
                                        <option value="2"> Denpasar </option>
                                    </select>
                                    :
                                    null
                            }

                        </div>
                    </div>


                    <div className="overflow-x-auto">

                        <div className=''>
                            <div className=''>
                                <table className='w-full table-auto'>
                                    <thead className="">
                                        <tr className="text-md">
                                            <th className="px-4 py-2 text-xl bg-green-700 text-white ">ID</th>
                                            <th className="px-4 py-2 text-xl bg-green-700 text-white">Product</th>
                                            <th className="px-4 py-2 text-xl bg-green-700 text-white">Quantity</th>
                                            <th className="px-4 py-2 text-xl bg-green-700 text-white">Date</th>
                                            <th className='px-4 py-2 text-xl bg-green-700 text-white'>Branch</th>
                                            <th className='px-4 py-2 text-xl bg-green-700 text-white'>Desc</th>
                                            <th className="px-4 py-2 text-xl bg-green-700 text-white">
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockData ? stockData.map((value, index) => {
                                            return (

                                                <tr key={value.id} className="hover:bg-gray-100 py-3">
                                                    <td className="px-4 py-3 text-center border-r">{value.id}</td>
                                                    <td className="px-4 py-3 text-center border-r">{value?.product?.name}</td>
                                                    <td className="px-4 py-3 text-center border-r">{value?.stock}</td>
                                                    <td className="px-4 py-3 text-center border-r">{value?.createdAt.split("T")[0]}</td>
                                                    <td className="px-4 py-3 text-center border-r">{value?.store_branch_id}</td>
                                                    <td className="px-4 py-3 text-center border-r">{value?.description == "Sales" || value?.description == "Cancel Delivery" ? `${value?.description} - Transaction ID ${value?.transaction_id}` : `${value?.description}`} </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {value?.description == "Sales" || value?.description == "Cancel Delivery" ? `${value?.description} - Transaction ID ${value?.transaction_id}` : null}
                                                    </td>
                                                </tr>

                                            )
                                        }) : null}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* {stockData && stockData.length > 0 ? (
                        stockData.map((value, index) => (
                            <div key={index} className=" my-3 h-[100px] bg-gradient-to-r to-yellow-300 from-green-600 rounded-lg">
                                <div className="bg-white h-full mx-2 rounded-md">
                                    <div className="text-md mx-2">
                                        <h1>Product name: {value?.product?.name}</h1>
                                        <div className="flex gap-2">
                                            <h1>Quantity: {value?.stock}</h1>
                                            <h1> || </h1>
                                            <h1 className="bg-green-400 rounded-xl w-fit px-2">Date: {value?.createdAt.split("T")[0]} </h1>
                                        </div>
                                    </div>
                                    <div className="border bg-gradient-to-b from-green-500 to-yellow-300 h-1 my-1"></div>
                                    <div className="flex gap-3 m-2">
                                        <h1>Note: {value?.description}</h1>
                                        <h1> Store Branch: {value?.store_branch_id} </h1>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="w-full flex justify-center my-12 ">
                            <div className="rounded-lg p-6 flex w-1/2 justify-center bg-gradient-to-b from-green-500 to-yellow-300 shadow-2xl">
                                <h1 className="bg-white rounded-xl w-full py-1 flex justify-center"> Unfortunately, there are no data to display at the moment.. </h1>
                            </div>
                        </div>
                    )} */}




                </div>

                <div className="flex justify-center my-10">
                    {
                        stockData && stockData.length > 0 ?
                            <PaginationFixed
                                page={page}
                                maxPage={maxPage}
                                handlePageChange={handlePageChange}
                                handlePrevPage={handlePrevPage}
                                handleNextPage={handleNextPage}
                            />
                            :
                            null
                    }
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ProductStockHistoryPage;