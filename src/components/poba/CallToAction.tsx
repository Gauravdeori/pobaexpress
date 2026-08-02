import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <section id="get-started" className="relative pb-24 lg:pb-32 px-5 lg:px-8 bg-background">
      <div className="mx-auto max-w-[80rem]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ duration: 0.7, type: "spring", stiffness: 50 }}
          className="bg-primary rounded-[3rem] overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-12 lg:px-20 relative shadow-xl"
        >
          {/* Subtle background decoration */}
          <div className="absolute inset-0 bg-gradient-green opacity-50" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-light/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8 md:gap-12 w-full">
            {/* Left Image */}
            <div className="w-48 h-48 md:w-56 md:h-56 flex-shrink-0 flex items-center justify-center -mt-16 md:-my-16">
              <img 
                src="/cta-bag.png" 
                alt="Groceries" 
                className="w-full h-full object-contain object-bottom drop-shadow-2xl" 
              />
            </div>
            
            {/* Center Text */}
            <div className="flex-1 max-w-xl self-center">
              <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                Craving something delicious?
              </h2>
              <p className="mt-3 text-lg text-primary-foreground/90">
                Order from your favorite restaurants in Jonai.
              </p>
            </div>
            
            {/* Right Button */}
            <div className="flex-shrink-0 self-center mt-6 md:mt-0">
              <Button className="rounded-full bg-card hover:bg-card/90 text-primary font-semibold px-8 h-14 shadow-lg text-lg" asChild>
                <a href="#order">
                  Order Now
                  <ArrowRight className="ml-2 size-5" />
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
