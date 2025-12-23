'use client';

import React, {useState} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from "@/components/modals/modal";
import {useStoreModal} from "@/hooks/use-store-modal";
import {useForm} from "react-hook-form";
import toast from "react-hot-toast";

const formSchema = z.object({
    name: z.string().min(1)
})

const StoreModal = () => {
    const storeModal = useStoreModal();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues:{
            name: '',
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // This function will be called when the form is submitted-
        try{
            setLoading(true);

            //api call to create store will go here

        }catch (error){
            toast.error("Something went wrong");
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <Modal title={'Create Store'} description={'Add a new store'} isOpen={storeModal.isOpen} onClose={storeModal.onClose}>FORM KISMI BURADA OLUCAK</Modal>
    )
}

export default StoreModal;