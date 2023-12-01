import { useEffect, useRef, useState } from "react"
import Button from "../../components/button"
import { BiSearchAlt } from "react-icons/bi";
import { api } from "../../api/api"
import ModalNewAdmin from "../../components/modalNewAdmin";
import ModalEditAdmin from "../../components/modalEditAdmin";
import toast, { Toaster } from "react-hot-toast";
import NavbarAdmin from "../../components/navbarAdmin";
import debounce from 'lodash/debounce';
import { useDebounce } from 'use-debounce';
import PaginationFixed from "../../components/paginationComponent";
import ConfirmConfirmation from "../../components/confirmModal";

export default function CreateAdminPage() {
    const [branch, setBranch] = useState(false);
    const [admin, setAdmin] = useState("");
    const [queryUsername, setQueryUsername] = useState("");
    const [queryBranch, setQueryBranch] = useState("");
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [sortBy, setSortBy] = useState("name")
    const [sort, setSort] = useState("ASC");
    const [debouncedName] = useDebounce(queryUsername, 1000);

    const handlePageChange = async (newPage) => {
        if (newPage >= 1 && newPage <= maxPage) {
            setPage(newPage);
            await onGetAdmins()
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

    const handleNameInput = (event) => {
        setPage(1);
        setQueryUsername(event.target.value);
        setPage(1);
    };

    const handleBranchInput = (event) => {
        setQueryBranch(event.target.value);
        setPage(1);
    };

    const onGetAdmins = async () => {
        try {
            const { data } = await api().get(`/users/admin-filter?username=${queryUsername}&branch=${queryBranch}&page=${page}`)
            setMaxPage(data.data.maxPages)
            setAdmin(() => data.data.filteredAdmins);
        } catch (error) {
            console.log(error);
        }
    }

    const handleResetFilter = async () => {
        try {
            setQueryUsername("")
            setQueryBranch("")
            setPage(1)
        } catch (error) {
            console.log(error);
        }
    }
    const onGetBranch = async () => {
        try {
            const { data } = await api().get('/branch/all');
            setBranch(data.data)
        } catch (error) {
            console.log(error);
        }
    }

    const handleDeactivateAdmin = async (email) => {
        const response = await api().patch('/users/deactivate-admin', { email: email })
        toast.success(response.data.message);
        onGetAdmins()
    }

    useEffect(() => {
        onGetAdmins()
        onGetBranch()
    }, [queryBranch, page, debouncedName])

    return (
        <div className="flex flex-col flex-grow min-h-screen gap-2">
            <Toaster />
            <div className="my-7">
                <NavbarAdmin />
            </div>

            <div className=" mx-5 pt-5 md:mx-20 lg:mx-32">
                <div className="lg:flex lg:justify-between mb-5">
                    <div className="flex text-5xl font-bold gap-2 py-5 text-green-800">Branch Admin Management</div>

                    <div className="grid place-content-center ">
                        <ModalNewAdmin getAdmins={onGetAdmins} />
                    </div>
                </div>

                <div className="border justify-evenly mb-10 lg:flex border-l-4 border-r-4 border-l-yellow-300 border-r-green-600 lg:gap-3 p-3 shadow-xl rounded-2xl lg:justify-center">

                    <div className="border-2 flex rounded-xl bg-white h-[50px] md:h-[48px] my-3 lg:w-[500px]">
                        <div className="flex items-center pl-2 text-green-800"><BiSearchAlt /></div>
                        <input type="text" className="lg:grid lg:place-content-center outline-none rounded-full w-full lg:w-[500px] text-lg pl-2" placeholder="Look up names here" value={queryUsername} onChange={handleNameInput} />
                    </div>
                    <div className="flex gap-2 justify-between lg:overflow-none overflow-x-auto my-3">
                        <div className="grid place-content-center">
                            <select id="store_branch_id" name="store_branch_id" onChange={handleBranchInput} value={queryBranch} className="h-[48px] px-2 border-2 rounded-xl w-[200px]">
                                <option value=""> All Branches </option>
                                {
                                    branch && branch.map((value, index) => {
                                        return (
                                            <option key={index} value={value.id}>
                                                {value.name}
                                            </option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <div className="grid place-content-center">
                            <h1>Sort By:</h1>
                        </div>
                        <div className="grid place-content-center">
                            <select name="" id="" className="h-[48px] px-2 border-2 rounded-xl w-[100px]">
                                <option value="name"> Name </option>
                                <option value="status"> Status </option>
                            </select>
                        </div>
                        <div className="grid place-content-center">
                            <select name="" id="" className="h-[48px] px-2 border-2 rounded-xl w-[80px]">
                                <option value="ASC"> ASC </option>
                                <option value="DESC"> DESC </option>
                            </select>
                        </div>
                        <div className="grid place-content-center">
                            <div className=" w-[70px] h-[48px] grid place-content-center text-lg lg:text-xl hover:underline  text-green-700 font-black" onClick={() => handleResetFilter()}>Reset</div>
                        </div>

                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {
                        admin && admin.map((value, index) => {
                            return (

                                <div className="rounded-xl border-2 border-l-8 border-green-700 border-l-green-700" key={value.id}>
                                    <div className="flex justify-between p-5 ">
                                        <div className="lg:flex grid place-content-center gap-2 lg:pl-5 ">
                                            <div className=" lg:w-[300px]">
                                                <div>
                                                    <div className="font-bold lg:text-3xl text-2xl">
                                                        {value.username}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm lg:text-lg">
                                                            {value?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:grid lg:gap-2 lg:place-content-center">
                                                <div>
                                                    <div className="lg:text-xl">{value?.store_branch?.name}</div>
                                                </div>
                                                <div>
                                                    <div className="font-black">
                                                        Status: <span className={value.isVerified == "unverified" ? "text-red-600" : "text-green-500"}> {value.isVerified == "verified" ? "Active" : "Inactive"} </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid place-content-center">
                                            <div className="lg:flex-row flex flex-col gap-4 lg:w-[300px]">
                                                <ModalEditAdmin getAdmins={onGetAdmins} adminData={value} key={index} />

                                                <ConfirmConfirmation
                                                    itemId={""}
                                                    onDelete={onGetAdmins}
                                                    apiEndpoint="users/deactivate-admin"
                                                    text={""}
                                                    bodyValue={value.email}
                                                    message={"Admin Status Changed"}
                                                    textOnButton={"Confirm"}
                                                    button={<button className={value.isVerified == "verified" ? " btn bg-red-600 hover:bg-red-600 rounded-2xl  text-white " : " btn bg-green-600 hover:bg-green-600 rounded-2xl  text-white w-[120px]"}> {value.isVerified == "verified" ? "Deactivate" : "Activate"} </button>} />


                                            </div>
                                        </div>
                                    </div>
                                </div>

                            )
                        })
                    }

                    {admin && !admin.length ? <div role="alert" className="alert alert-error w-full ">
                        <span className="">Sorry, the admin that you are looking for is not available.</span>
                    </div> : null}

                </div>

                <div className="flex justify-center my-10">
                    <PaginationFixed
                        page={page}
                        maxPage={maxPage}
                        handlePageChange={handlePageChange}
                        handlePrevPage={handlePrevPage}
                        handleNextPage={handleNextPage}
                    />
                </div>
            </div>

        </div>
    )
}
{/* <div className="my-5 mx-3 rounded-full h-[100px] w-[100px]">
<img className="object-cover rounded-full h-full w-full" src={process.env.REACT_APP_URL + `${value?.profile_picture}`} alt="user profile" />
</div> */}