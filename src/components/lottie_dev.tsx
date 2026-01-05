import Lottie from "lottie-react";
import lottieAnimation from "@/assets/lotties/dev.json";

const LottieDev = () => {
    return (
        <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
            <Lottie 
                animationData={lottieAnimation}
                loop={true}
                autoplay={true}
            />
        </div>
    );
};

export default LottieDev;