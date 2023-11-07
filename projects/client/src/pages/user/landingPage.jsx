import Navbar from "../../components/navbarUser"
import Footer from "../../components/footer"
import Jumbotron from "../../components/jumbotron"
import RecommendProducts from "../../components/recommendProducts"
import ModalAddress from "../../components/modalAddress"
import CategoryCard from "../../components/categoryCard"
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { onCheckIsLogin } from "../../redux/Features/users";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom"
import { api1 } from "../../api/api";
import toast, { Toaster } from "react-hot-toast";

const LandingPage = () => {
    const [branchLoc, setBranchLoc] = useState("")
    const [products, setProducts] = useState("")
    const [branchName, setBranchName] = useState()
    const [currentLocation, setCurrentLocation] = useState(null);
    const [nearestLocation, setNearestLocation] = useState(null);
    const [category, setCategory] = useState([]);
    const dispatch = useDispatch();
    const api = api1();
    const closestBranch = useSelector((state) => state.branch.closestBranch);

    const onGetCategory = async () => {
        try {
            const category = await api.get(`/category/all`);
            // console.log(category.data.data);
            setCategory(category.data.data);
        } catch (error) {
            console.log(error);
        }
    };
    const getBranch = async () => {
        try {
            const allBranch = await api.get('/branch/all')
            setBranchLoc(allBranch.data.data)
        } catch (error) {
            console.log(error);
        }
    }

    const nearestBranch = async () => {
        try {
            const branch = await api.get(`/branch/nearest/${closestBranch.id}`)
            console.log(branch.data.data, "ini data branch");
            setProducts(branch.data.data)
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        onGetCategory();
        getBranch()
        nearestBranch()
    }, []);


    // useEffect(() => {
    //     if (branchLoc.length) calculation()
    //     console.log(branchLoc);
    // }, [branchLoc])



    return (
        <div className="">
            <Toaster />
            <Navbar />
            <div className="mt-[70px]">
                <div className="flex justify-center px-3 md:justify-start md:ml-20 lg:ml-48 py-5">
                    <ModalAddress />
                </div>
                <Jumbotron />
                <div className="">
                    <div className="h-[190px] mt-10 pt-5 px-5 lg:h-[190px] lg:py-5 overflow-x-auto m-5 md:mx-24 lg:mx-48 gap-5 flex bg-gradient-to-b from-yellow-200 to-green-200 rounded-3xl">
                        {category.map((value, index) => {
                            return (
                                <div key={index} className="">
                                    <Link to={`/products?category=${value.id}`}>
                                        <CategoryCard name={value.name} image={value.image} />
                                    </Link>
                                </div>

                            )
                        })}
                    </div>
                </div>

                <div className="mb-10">
                    <RecommendProducts data={products} branchName={closestBranch.name} />
                </div>
            </div>
            <Footer />
        </div>
    )
}
export default LandingPage