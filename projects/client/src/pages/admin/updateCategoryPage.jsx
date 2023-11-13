import CategoryCard from "../../components/categoryCard";
import Navbar from "../../components/navbarUser";
import Footer from "../../components/footer";
import React, { useEffect, useRef, useState } from "react";
import { api1 } from "../../api/api";
import debounce from 'lodash/debounce';
import ModalNewCategory from "../../components/modalNewCategory";
import toast, { Toaster } from "react-hot-toast";
import { AiFillEdit } from "react-icons/ai";
const UpdateProductsCategoryPage = () => {
    const inputImage = useRef()
    const [category, setCategory] = useState([]);
    const [catId, setCatId] = useState("");
    const [inputCat, setInputCat] = useState("");
    const [modal, setModal] = useState(false);
    const api = api1();
    const pageTopRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCategory, setFilteredCategory] = useState([]);
    const onGetCategory = async () => {
        try {
            const category = await api.get(`category/all`);
            setCategory(category.data.data);
        } catch (error) {
            console.log(error);
        }
    };
    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };
    const handleEditCategory = async (catId) => {
        try {
            setCatId(catId);
            const res = await api.get(`category/onecategory/${catId}`);
            setInputCat(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };
    const handleSaveCat = async () => {
        try {
            const res = await api.patch(`category/savecategory`, {
                inputCat,
                id: catId,
            });
            setModal(!modal);
            if (pageTopRef.current) {
                pageTopRef.current.scrollIntoView({ behavior: "smooth" });
            }
            setSearchQuery("");
            onGetCategory();
        } catch (error) {
            console.log(error);
        }
    };
    const onSelectId = async (categoryId) => {
        try {
            setCatId(categoryId)
        } catch (error) {
            console.log(error);
        }
    };
    const onSelectImages = async (event) => {
        try {
            console.log(catId);
            const file = event.target.files[0]
            if (file) {
                if (file.size > 1000000 || !/image\/(png|jpg|jpeg)/.test(file.type)) throw {
                    message: 'File must be less than 1MB and in png, jpg, or jpeg format!'
                }
                console.log(file);
                const formData = new FormData();
                formData.append('image', file);
                const response = await api.patch(`category/editimage/${catId}`, formData)
                console.log(response.data.data);
                toast.success("Category Image Updated")
                onGetCategory();
            }
        } catch (error) {
            console.log(error);
        }
    };
    const onDeleteCategory = async (catId) => {
        try {
            const deleteCategory = await api.patch(`category/deletecategory/${catId}`)
            console.log(deleteCategory);
            toast.success("Delete Category Success")
            onGetCategory();
        } catch (error) {
            console.log(error);
        }
    };
    const debouncedSetFilteredCategory = debounce((filtered) => {
        setFilteredCategory(filtered);
    }, 1000);
    useEffect(() => {
        onGetCategory();
    }, []);
    useEffect(() => {
        const filtered = category.filter((cat) =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        debouncedSetFilteredCategory(filtered);
    }, [searchQuery, category]);
    return (
        <div ref={pageTopRef} className="">
            <Toaster />
            <Navbar />
            <div className="">
                <div className="flex flex-row mt-[70px] mx-5 pt-5 md:mx-20 lg:mx-32 ">
                    <div className="text-4xl font-bold gap-2 py-5 text-green-800">
                        Edit Category
                    </div>
                </div>
                <div className="grid place-content-center md:place-content-start md:ml-20 lg:ml-32">
                    <ModalNewCategory />
                </div>
                <div className="ml-32 mt-5 ">
                    <input
                        type="text"
                        placeholder="Search categories"
                        className="input w-1/4 bg-gradient-to-r from-yellow-300 to-green-600"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                    />
                </div>
                <div className="overflow-x-auto px-5 my-8 md:px-20 lg:px-32">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="text-xl">Image</th>
                                <th className="text-xl">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategory.map((value, index) => {
                                return (
                                    <tr key={index} className="hover border hover:border-b-green-700 hover:border-b-4 pl-0">
                                        <td>
                                            <div className="relative pt-5">
                                                <CategoryCard image={value.image} style="w-[100px] h-[80px] hover:shadow-none hover:scale-100" />
                                                <div className="absolute left-0 right-0 top-0">
                                                    <input type="file" accept=".jpg, .jpeg, .png" ref={inputImage} hidden onChange={(event) => onSelectImages(event)} />
                                                    <div onClick={() => { inputImage.current.click(); onSelectId(value.id) }}>
                                                        <AiFillEdit className="text-3xl rounded-full p-2 w-[40px] h-[40px] absolute top-0 left-0 z-1 bg-green-800 text-white hover:scale-105 ease-in duration-200" />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <th className="text-lg">{value.name}</th>
                                        <td>
                                            <button className="btn bg-yellow-300 border-4 border-green-800 hover:bg-yellow-300 hover:border-green-800"
                                                onClick={() => {
                                                    setModal(true);
                                                    handleEditCategory(value.id);
                                                }}>EDIT
                                            </button>
                                        </td>
                                        <td>
                                            <button className="btn bg-red-600 ml-3 text-white border-4 border-black hover:bg-red-600 hover:border-black"
                                                onClick={() => {
                                                    onDeleteCategory(value.id);
                                                }}>DELETE</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            </div>
            {modal ? (<div className="fixed backdrop-blur-md bg-black/30 h-screen w-full z-50 top-0 right-0 duration-600 ease-in"></div>) : ("")}
            <div className={modal ? `fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[50%] lg:w-[30%] p-10 rounded-xl bg-gradient-to-l from-yellow-300 to-green-600` : `hidden`}>
                <h3 className="font-bold text-4xl text-white">Edit Category</h3>
                <div className="flex flex-col gap-5 mt-5">
                    <div>
                        <div className="text-white pb-2"> Category Name</div>
                        <input className="input w-full" type="text" value={inputCat} onChange={(e) => setInputCat(e.target.value)} />
                    </div>
                </div>
                <div className="modal-action">
                    <button className="btn bg-red-600 text-white border-4 border-black hover:bg-red-600 hover:border-black" onClick={() => setModal(!modal)}>Cancel</button>
                    <form method="dialog" onSubmit={handleSaveCat}>
                        <button className="btn bg-yellow-300 text-black border-4 border-green-600 hover:bg-yellow-300 hover:border-green-600">Submit</button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    )
}
export default UpdateProductsCategoryPage