import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../views/Login";
import Register from "../views/Register";
import AdminHome from "../views/AdminHome";
import UserHome from "../views/UserHome";
import PrintingHome from "../views/PrintingHome";
import GraphicHome from "../views/GraphicHome";
import CreatePostForm from "../../component/views/forms/Admin/CreatePostForm";

import ProtectedRoutes from "./ProtectedRoutes";
import DisplayForm from "../../component/views/forms/Admin/displayForm";
import EditPostForm from "../views/forms/Admin/EditPostForm";
import UserListForm from "../views/forms/Admin/UserListForm";
import GuestRoutes from "./GuestRoutes";
import HomePage from "../views/HomePage";
import CommunityJoin from "../views/CommunityJoin";
import UserProfileForm from "../views/forms/Admin/UserProfileForm";
import ShareLocation from "../views/forms/Printing Shop/ShareLocationForm";
import ChatForm from "../views/forms/Admin/MessageForm";
import ArtistPrintingProviders from "../views/forms/Admin/MyPostForm";
import RequestForm from "../views/forms/Admin/RequestForm";
import ClientPost from "../views/forms/Admin/ClientPostForm";
import ClientProfile from "../views/forms/Admin/ClientProfileForm";
import DesignerInformationPage from "../views/designerInfo";
import PrintingInformationPage from "../views/printingInfo";
import MapView from "../views/mapview";
import DesignerPostForm from "../views/forms/Admin/designerForm";
import ProviderPostForm from "../views/forms/Admin/provideForm";
import Allpost from "../views/forms/Admin/MyPost1Form";
import PaymentSuccess from "../views/PaymentSuccess";
import PaymentFailed from "../views/PaymentFailed";
import Balance from "../views/UserBalance";
import PaymentsTable from "../views/UserBalance";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<GuestRoutes />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/join" element={<CommunityJoin />} />
        <Route path="/desingner-Info" element={<DesignerInformationPage />} />
        <Route path="/printing-Info" element={<PrintingInformationPage />} />
      </Route>

      {/* Protected routes for Admin */}
      <Route element={<ProtectedRoutes roles={["Admin"]} />}>
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/users" element={<UserListForm />} />
      </Route>

      {/* Protected routes for User */}
      <Route element={<ProtectedRoutes roles={["User"]} />}>
        <Route path="/user" element={<UserHome />} />
        <Route path="/getlocation" element={<MapView />} />
        {/* <Route path="/userbalance" element={<Balance />} /> */}

        {/* <Route path="/List-of-Desinger&Printing-Provider" element={<ArtistPrintingProviders />} /> */}
      </Route>

      {/* Protected routes for Graphic Designer */}
      <Route element={<ProtectedRoutes roles={["Graphic Designer"]} />}>
        <Route path="/graphic-designer" element={<GraphicHome />} />
      </Route>

      {/* Protected routes for Printing Shop */}
      <Route element={<ProtectedRoutes roles={["Printing Shop"]} />}>
        <Route path="/printing-shop" element={<PrintingHome />} />
        {/* <Route path="/share-location" element={<ShareLocation />} /> */}
      </Route>

      {/* Routes accessible by multiple roles */}
      <Route
        element={
          <ProtectedRoutes
            roles={["Admin", "User", "Graphic Designer", "Printing Shop"]}
          />
        }
      >
        <Route path="/dashboard" element={<DisplayForm />} />
        <Route path="/posts/:postId" element={<EditPostForm />} />
        <Route path="/chat/:userId" element={<ChatForm />} />
        <Route path="/chats" element={<ChatForm />} />
        <Route path="/users/:id/profile" element={<UserProfileForm />} />
        <Route path="/share-location" element={<ShareLocation />} />
        <Route
          path="/List-of-Desinger&Printing-Provider"
          element={<ArtistPrintingProviders />}
        />
        <Route path="/posts" element={<CreatePostForm />} />
        <Route path="/provider/:id/profile" element={<UserProfileForm />} />
        <Route path="/notifications" element={<RequestForm />} />
        <Route path="/clientpost" element={<ClientPost />} />
        <Route path="/clients/:id/profile" element={<ClientProfile />} />
        <Route path="/designerpost" element={<DesignerPostForm />} />
        <Route path="/providerpost" element={<ProviderPostForm />} />
        <Route path="/allposts" element={<Allpost />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route
          path="/payment/failed"
          element={<PaymentFailed message="Payment not found." />}
        />
        <Route path="/paymentstable" element={<PaymentsTable />} />
      </Route>

      <Route
        element={
          <ProtectedRoutes
            roles={["Admin", "Graphic Designer", "Printing Shop"]}
          />
        }
      >
        <Route path="/posts" element={<CreatePostForm />} />
        <Route path="/users/:id/profile" element={<UserProfileForm />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
